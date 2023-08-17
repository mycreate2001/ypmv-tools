import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {  BasicData, ChildData, createBasicData, createChildData } from 'src/app/interfaces/basic.model';
import { BasicDataExt, createBasicDataExt, createOrderData, OrderData, OrderDataStatusType, _DB_ORDERS, _STORAGE_ORDERS } from 'src/app/interfaces/order.model';
import { CodeFormatConfig } from 'src/app/interfaces/codeformat';
import {  _DB_COMPANY } from 'src/app/interfaces/company.model';
import { CoverData,  _DB_COVERS } from 'src/app/interfaces/cover.interface';
import { ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/interfaces/tools.model';
import {  _DB_USERS } from 'src/app/interfaces/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { getUpdateImages, StorageService } from 'src/app/services/firebase/storage.service';
import { UtilService } from 'src/app/services/util/util.service';
import { compareArrays, getList } from 'src/app/utils/minitools';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from '../qrcode/qrcode.page';
import { SearchCompanyPage, SearchCompanyPageOpts, SearchCompanyPageOuts, SearchCompanyPageRole } from '../search-company/search-company.page';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts, SearchToolPageRole } from '../search-tool/search-tool.page';
import { ToolStatusPage, ToolStatusPageOpts, ToolStatusPageOuts, ToolStatusPageRole } from '../tool-status/tool-status.page';
import { createStatusInfor, createToolStatus, StatusInf, StatusRecord, ToolStatus, _DB_STATUS_RECORD, _STATUS_NOTYET, _STORAGE_STATUS_RECORD, createStatusRecord } from 'src/app/interfaces/status-record.model';
import { createSelfHistory, SelfHistory } from 'src/app/interfaces/save-infor.model';
import { BasicItem, createBasicItem } from 'src/app/interfaces/basic-item.interface';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
  /** input variable */
  order:OrderData;
  orderId:string='';

  /** internal variable */
  selected:ChildData[]=[];
  status:StatusRecord;
  delImages:string[]=[];
  /** control variable */
  isAvailable:boolean=false;
  isAdmin:boolean=false;
  isOwner:boolean=false;
  isEdit:boolean=false;
  isSave:boolean=false;
  isNew:boolean=false;
  conflictList:string[]=[];
  code:string;
  //const
 CAN_BOOK_LIST:OrderDataStatusType[]=['new','created']  ;  // can handler with booking button
 CAN_RENT_LIST:OrderDataStatusType[]=['approved'];         // can hanler with renting botton
 CAN_APPROVE_LIST:OrderDataStatusType[]=['created'];       // can handler with approving button
 CAN_CANCEL_LIST:OrderDataStatusType[]=['created','approved']  // can handler with cancel button
 CAN_DELETE_LIST:OrderDataStatusType[]=['new','created','approved','returned','cancel','rejected'] // can cancel with button
 CAN_RETURN_LIST:OrderDataStatusType[]=['renting'];      // can hanler with returning button
 CAN_EDIT_LIST:OrderDataStatusType[]=['new','created']
 SCANS:OrderDataStatusType[]=['approved','renting'];
 APPROVES:OrderDataStatusType[]=['approved','renting','rejected','returned'];
 RETURNS:OrderDataStatusType[]=['renting'];
 SHOW_STATUSES:OrderDataStatusType[]=['approved','renting','returned']
  constructor(
    private auth:AuthService,
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService,
    private util:UtilService,
    private storage:StorageService
  ){ }

  ngOnInit() {
    this._init()
    .then(({order,isNew})=>{
      this.order=order;
      this.orderId=order.id;
      this.isNew=isNew;
      const data:ToolStatus[]=this.order.tools.map(tool=>createToolStatus({...tool,images:[],status:createStatusInfor(tool)}))
      const record:StatusRecord=createStatusRecord({data,user: createBasicItem({...this.auth.currentUser,type:'user'})})
      console.log('TEST-76',{record});
      switch(this.order.status){
        case 'approved':
          if(!this.order.checkingTools)  return record;
          return this.db.get(_DB_STATUS_RECORD,this.order.checkingTools) as Promise<StatusRecord>
        break;
        case 'renting':
          if(!this.order.returnTools) return record
          return this.db.get(_DB_STATUS_RECORD,this.order.returnTools) as Promise<StatusRecord>
        break;
      }
      // console.log("TEST-001:status",this.order.status)
      // throw new Error('status is not correctly')
    })
    .then(record=>{
      this.status=record;
      console.log("Initial",this);
      this._refreshView()
    })
    .catch(err=>console.log("\n#### ERROR[1]: get data error",err))
  }

  
  //////////////// BUTTONS HANDLERS /////////////////

  /** check tool status */
  toolStatus(tool:BasicDataExt){
    const status=this.status.data.find(t=>t.id==tool.id)
    console.log("test-105",{status})
    if(!status) return this.disp.msgbox("ERROR<br>Incorrect data")
    const props:ToolStatusPageOpts={
      tool,
      status
    }
    this.disp.showModal(ToolStatusPage,props)
    .then(result=>{
      const role=result.role as ToolStatusPageRole;
      console.log("data",{result})
      if(role!=='save') return
      const data=result.data as ToolStatusPageOuts
      //update tools
      // result
      switch(this.order.status){
        case 'approved':
          tool.before=data.totalStatus;
          break;
        
        case 'renting':
          tool.after=data.totalStatus;
          break;
      }

      //update for status
      const pos=this.status.data.findIndex(d=>d.id==tool.id)
      if(pos==-1) return this.disp.msgbox("ERROR<br>status is abnormal");
      this.status.data[pos]=data.status;
      console.log("TEST:after get status",{status:data.status,globalStatusData:this.status.data})
    })
  }

  /** QR code */
  printCode(e){
    // this.util.generaQRcode(this.order.id,{label:this.order.purpose,size:42,type:'order'})
    this.util.printCode(e,this.order.id,{type:'order',label:this.order.comment})
  }

  /** verifycation by scan */
  scan(){
    const props:QRcodePageOpts={
      type:'analysis',title:[CodeFormatConfig.cover.name,CodeFormatConfig.tool.name].join(",")
    }
    this.disp.showModal(QrcodePage,props)
    .then(scan=>{
      const data=scan.data as QRcodePageOuts;
      const role=scan.role as QRcodePageRole;
      if(role!=='ok') return;
      let code=data.analysis[CodeFormatConfig.cover.name]
      code=code?code:data.analysis[CodeFormatConfig.tool.name];
      if(!code) return console.log("it not [coverId,toolId]",{analysis:data.analysis})
      //
      const tools=this.order.tools.filter(x=>x.id==code)
      //double code
      if(tools.length>1) {
        console.warn("debug-001: double tools",{tools,code})
        throw new Error("scan-001: double tools");
      }

      this.toolStatus(tools[0])
    })
    .catch(err=>{
      console.warn("\n **** ERROR ****\n",err.message);
    })
  }

  /** exist */
  done(role:BookingPageRoleType='save'){
    const data:BookingPageOuts={
      order:this.order
    }
    this.modal.dismiss(data,role)
  }

  /** add more tool */
  pickupTool(){
    const props:SearchToolPageOpts={exceptionList:this.order.tools.map(x=>createChildData(x))}
    this.disp.showModal(SearchToolPage,props)
    .then(result=>{
      const role=result.role as SearchToolPageRole;
      if(role!=='ok') return; // not select
      const data=result.data as SearchToolPageOuts
      this.conflictList=[];
      this._getToolfromPickup(data.search)
      .then(tools=>{
        //check double
        tools=tools.filter(t=>!this.order.tools.some(x=>x.id==t.id&&x.type==t.type))
        this.order.tools=this.order.tools.concat(tools.map(t=>createBasicDataExt(t)));
      })
    })
  }

  fabScanHandle(){
    const EditList:OrderDataStatusType[]=['created','new'];
    const CheckList:OrderDataStatusType[]=['approved','renting'];
    if(EditList.includes(this.order.status)) return this.pickupToolByScan();  //add tool/box
    if(CheckList.includes(this.order.status)) return this.scan();             // verify tool/box
    console.log("Not allow with this status");
  }

  pickupToolByScan(){
    const props:QRcodePageOpts={
      type:'analysis',
      title:'tool/box'
    }

    this.disp.showModal(QrcodePage,props)
    .then(result=>{
      const role=result.role as QRcodePageRole
      if(role!='ok') throw new Error("cancel by user");
      const data=result.data as QRcodePageOuts;
      const analysis=data.analysis;
      const _toolId=analysis[CodeFormatConfig.tool.name];
      const _coverId=analysis[CodeFormatConfig.cover.name];
      if(!_toolId&& !_coverId) throw new Error("It's not tool/box id");
      const child:BasicData=createBasicData({type:_toolId?'tool':'cover',id:_toolId?_toolId:_coverId});
      this._getToolfromPickup([child])
      .then(tools=>{
        const xtools=tools.filter(t=>!this.order.tools.some(x=>x.id==t.id))
        this.order.tools.concat(tools.map(t=>createBasicDataExt(t)));
      })
    })
  } 


  /** select company */
  selectCompany(){
    const props:SearchCompanyPageOpts={
      mutilSelect:false
    }
    this.disp.showModal(SearchCompanyPage,props)
    .then(result=>{
      const role=result.role as SearchCompanyPageRole
      const data=result.data as SearchCompanyPageOuts
      if(role=='ok'){
        this.order.company=createBasicItem({...data.companies[0],type:'company'});
        return;
      }
    })
  }

  /** book */
  async book(){
    if(!this.CAN_BOOK_LIST.includes(this.order.status)) return; // check status can book
    if(!this._verify()) return;
    this._getConflict()
    .then(conflicts=>{
      // this.conflictList=conflicts.reduce((acc,cur)=>[...acc,...cur.children],[]).map(x=>x.type+x.id)
      // console.log("configlist:",this.conflictList)
      // if(conflicts.length) return this.disp.msgbox("Some tools/jigs are not available")
      // this.order.status='created';
      // this.db.add(_DB_ORDERS,this.order)
      // this.done();
      if(conflicts.length) return this.disp.msgbox("Some tools/jigs are not available")
      this.order.status='created';
      return this.db.add(_DB_ORDERS,this.order,(updateList,newOrder,oldOrder)=>{
        const histories:SelfHistory[]=oldOrder['histories']||[];
        histories.push(createSelfHistory({userId:this.auth.currentUser.id,updateList}))
        return {...newOrder,histories}
      })
    })
    .then(()=>this.done('save'))
  }

  async rent(){
    //verify data
    if(!this.CAN_RENT_LIST.includes(this.order.status)) return this.disp.msgbox("wrong data");
    if(this.order.approvedResult!='Accept') return this.disp.msgbox("these tools not accept to rent")
    if(getNotCheckStatus(this.status)) return this.disp.msgbox("Tool not yet complete check status<br> pls check status of all tools/jigs")
   
    //------ updatetool stay ----------------//
    let list:string[]=this.order.tools.filter(x=>x.type=='cover').map(x=>x.id)

    const covers:CoverData[]=await this.db.gets(_DB_COVERS,list)
    covers.forEach(cover=>{
      cover.stay=this.order.company;
      this.db.add(_DB_COVERS,cover)
    })
    list=this.order.tools.filter(x=>x.type=='tool').map(x=>x.id)
    const tools:ToolData[]=await this.db.gets(_DB_TOOLS,list);
    tools.forEach(tool=>{
      tool.stay=this.order.company;
      this.db.add(_DB_TOOLS,tool)
    })

    //----------- save data -------------//
    const infor=await this.updateStatusRecord()           // update images
    infor.rentDate=new Date().toISOString()         //date
    infor.checkingAgencyName=''                     // @@@
    infor.checkingAgencyId=''                       // @@@
    infor.status='renting';                         // status
    this.db.add(_DB_ORDERS,infor)                   // upload
    this.done();
  }
  

  /** approved */
  approve(){
    //check status
    if(!this.CAN_APPROVE_LIST.includes(this.order.status)) return this.disp.msgbox(`This order '${this.orderId}' is wrong data<br>pls check it`)
    this.disp.msgbox(
      "pls input your comment",
      {
        inputs:[{label:'comment',type:'textarea'}],
        buttons:[{text:'Accept',role:'accept'},{text:'Reject',role:'reject'},{text:'Cancel',role:'cancel'}],
        mode:'ios'
      }
    )
    .then(result=>{
      console.log("result",result);
      const role=result.role.toUpperCase();
      if(['ACCEPT','REJECT'].includes(role)){
        this.order.approvedResult=role=='ACCEPT'?'Accept':'Reject'  // result
        this.order.status='approved'                                // status
        this.order.approvedBy=this.auth.currentUser.id              // auth
        this.order.approvedComment=result.data.values[0]            // comment
        this.order.approvedDate=new Date().toISOString()            // date
        console.log('test',this.order)
        this.db.add(_DB_ORDERS,this.order)
        this.done('save');
        return;
      }
      
    })
  }

  /** cancel */
  cancel(){
    //check infor
    if(!this.CAN_CANCEL_LIST.includes(this.order.status)) return this.disp.msgbox(`Order '${this.orderId}' is wrong data<br> pls check it`)
    this.order.status='cancel'
    this.db.add(_DB_ORDERS,this.order)
    this.done('cancel');
  }

  /** delete booking (admin only) */
  delete(){
    //verification
    if(!this.CAN_DELETE_LIST.includes(this.order.status)) return this.disp.msgbox(`Order '${this.orderId}' is wrong data<br>pls check it`) 
    //configmation
    this.disp.msgbox("Are you sure want to delete this booking?",
    {buttons:[{text:'Cancel',role:'cance'},{text:'Delete',role:'delete'}]})
    .then(result=>{
      if(result.role!='delete') return;
      this.db.delete(_DB_ORDERS,this.order.id);
      this.done('delete');
    })
    
  }

  /** returning tools/jigs to YPMV */
  async returning(){
    //check condition

    if(!this.CAN_RETURN_LIST.includes(this.order.status)) return console.warn("wrong status/process")
    // const notCheck:boolean=this.order.tools.some(tool=>status(tool.afterStatus,tool.type)=='Not Check')
    // if(notCheck) return this.disp.msgbox("Tool not yet complete check status<br> pls check status of all tools")
    const notCheck:boolean=this.status.data
      .reduce((acc,cur)=>[...acc,cur.status],[])
      .some((stt:StatusInf)=>stt.value==_STATUS_NOTYET.value)
    if(notCheck) return this.disp.msgbox("Tool not yet complete check status<br> pls check status of all tools")
    //---------- change stay -----------------//
    const coversId=this.order.tools.filter(x=>x.type=='cover').map(x=>x.id)
    this.db.gets(_DB_COVERS,coversId)
    .then((covers:CoverData[])=>{
      covers.forEach(cover=>{
        cover.stay=null
        this.db.add(_DB_COVERS,cover)
      })
    })

    const toolsId=this.order.tools.filter(x=>x.type=='tool').map(x=>x.id)
    this.db.gets(_DB_TOOLS,toolsId).then((tools:ToolData[])=>{
      tools.forEach(tool=>{
        tool.stay=null//return tool
        this.db.add(_DB_TOOLS,tool)
      })
    })

    //------------- save information --------//
    const infor=await this.updateStatusRecord();
    infor.returnAgencyName=''//@@@
    infor.returnAgencyId=''  //@@@
    infor.status='returned';
    this.db.add(_DB_ORDERS,infor)
    this.done();
  }

  /** checkbox handler */
  checkbox(child:ChildData,event){
    const status=event.detail.checked
    if(status) return this.selected.push(child)
    //uncheck
    const pos=this.selected.findIndex(s=>s.id==child.id&&s.type==child.type);
    if(pos==-1) return console.log("\n### ERROR: data wrong");
    this.selected.splice(pos,1);
  }


  /**
   * remove tools/cover from list
   * @effect  selected
   * @effect infor.scheduleTools
   */
  removeTool(){
    this.selected.forEach(select=>{
      const i=this.order.tools.findIndex(s=>s.id==select.id&&s.type==select.type)
      if(i==-1) return console.log("\n### ERROR: not exist %s '%s'",select.type,select.id)
      this.order.tools.splice(i,1)
    })
    this.selected=[];
    this.conflictList=[]
  }

  //////////////////////////// BACK GROUND FUNCTIONS //////////////////////////
   /** get all tools/covers from cover */
   private async _getchildren(childrenId:ChildData[],list:ChildData[]):Promise<ChildData[]>{
    const coversId:string[]=childrenId.filter(child=>{
      const tool=list.find(x=>x.id==child.id&&x.type==child.type);
      if(!tool ) {  // new child => add
        list.push(child)
        return child.type=='tool'?false:true;
      }
      return false;//have already
    }).map(x=>x.id)

    const covers=await this.db.gets(_DB_COVERS,coversId) as CoverData[]
    childrenId=covers.reduce((acc,curr)=>[...acc,...curr.childrenId],[])
    if(childrenId.length) {list=await this._getchildren(childrenId,list)}
    return list;
  }

  /** get tools/covers from pickup tool (search) */
  private async _getToolfromPickup(iTools:BasicData[]):Promise<BasicData[]>{
    // console.log('check[1]: iTools:',{iTools})
    const children=await this._getchildren(iTools,[]);
    // console.log('check[2] _getChildren:',{children}) 
    const tools:ToolData[]=await this.db.gets(_DB_TOOLS,children.filter(x=>x.type=='tool').map(x=>x.id));
    const models:ModelData[]=await this.db.gets(_DB_MODELS,getList(tools,"model"))
    const covers:CoverData[]=await this.db.gets(_DB_COVERS,children.filter(x=>x.type=='cover').map(x=>x.id));
    // console.log('check[3] covers,tools,models:',{covers,tools,models}) 
    const outs:BasicData[]=[];
    //tools
    tools.forEach(tool=>{
      const model=models.find(m=>m.id==tool.model);
      if(!model) return console.log("\n### ERROR: cannot find model '%s' from db",tool.model)
      outs.push(createBasicData({...model,id:tool.id,type:'tool',modelId:model.id}))
    })

    //cover
    covers.forEach(cover=>{
      outs.push(createBasicData({...cover,type:'cover',modelId:cover.id}))
    })
    // console.log('check[4] finish',{outs}) 
    return outs;
  }

  /** verify input true=OK */
  private _verify():boolean{
    let list=[
      {key:"companyId",name:'Company'},
      {key:"purpose",name:'Purpose'},
      {key:"scheduleStart",name:'Schedule Start'},
      {key:"scheduleFinish",name:'Schedule Finish'},
      {key:'tools',name:'Tools'}
    ]
    list=list.filter(item=>Array.isArray(this.order[item.key])?!this.order[item.key].length:!this.order[item.key])
    if(list.length) {
      this.disp.msgbox("missing input<br>"+list.map(x=>x.name).join(","));
      return false
    }
    return true;
  }

  private _getConflict():Promise<{tools:BasicData[],start:string,finish:string}[]>{
    //get order valid
    const dontCareList:OrderDataStatusType[]=['returned','rejected','cancel']
    const a= this.db.search(_DB_ORDERS,{key:'status',type:'not-in',value:dontCareList})
    //get available orders
    .then((orders:OrderData[])=>{
      //start time, finish time, tools
      return orders.map(order=>{
        if(['approved','created','approved'].includes(order.status)) 
          return {tools:order.tools,start:order.scheduleStart,finish:order.scheduleFinish}
        if(order.status=='renting')
          return {tools:order.tools,start:order.rentDate,finish:order.scheduleFinish}
        return null;
      }).filter(x=>x)
    })
    // filter orders by times
    .then(infors=>{
        //check time
        const start=new Date(this.order.scheduleStart).getTime();
        const finish=new Date(this.order.scheduleFinish).getTime();
        return infors.filter(infor=>{
          const _start=new Date(infor.start).getTime();
          const _finish=new Date(infor.finish).getTime();
          if((start-_start)*(start-_finish)<=0 ||
             (finish-_start)*(finish-_finish)<=0 ){
              return true;// It's may conflict. next step check tools
          }
          return false;// OK, dont care this case
        })
    })
    // filter order by tools ID
    .then(infors=>infors.filter(infor=>compareArrays(this.order.tools,infor.tools,{items:['id']})))
    return a;

  }

  /** get booking infor */
  private _init():Promise<{isNew:boolean,order:OrderData}>{
    return new Promise((resolve,reject)=>{
      let isNew:boolean=false;
      // case 1: new case
      if(!this.order && !this.orderId){//new case
        const auth=this.auth.currentUser
        const order=createOrderData({user:createBasicItem({...auth,type:'user'}),company:auth.company});
        isNew=true;
        return resolve({isNew,order})
      }
      // case 2: already exist db
      if(this.order) return resolve({order:this.order,isNew})
      // case 3: need to get from db
      this.db.get(_DB_ORDERS,this.orderId)
      .then((order:OrderData)=>resolve({order,isNew}))
      .catch(err=>reject(err))
    })
  }

  
  /**
   * update status & correct order data
   * @returns 
   */
  updateStatusRecord():Promise<OrderData>{
    //delete all delImages
    this.delImages.forEach(img=>{
      this.storage.delete(img)
      .then(()=>{
        const pos=this.delImages.indexOf(img)
        this.delImages.splice(pos,1)
      })
    })

    //upload images
    const uploadStatus=this.status.data.map(data=>{
      const {addImages,currImages}=getUpdateImages(data.images);
      return this.storage.uploadImages(addImages,_STORAGE_STATUS_RECORD)
      .then(urls=>{
        data.images=[...urls,...currImages];
        return data;
      })
    })

    return Promise.all(uploadStatus).then(data=>{
      this.status.data=data;
      //update ids
      this.status.ids=this.order.tools.map(tool=>`${tool.type}-${tool.id}`)
      return this.db.add(_DB_STATUS_RECORD,this.status,(updateList,newStatus,oldStatus)=>{
        const histories:SelfHistory[]=oldStatus['histories']||[];
        histories.push(createSelfHistory({updateList,userId:this.auth.currentUser.id}))
        return {...newStatus,histories}
      })
      .then((record:StatusRecord)=>{
        //correct cstatus
        switch(this.order.status){
          case 'approved':
            this.order.checkingTools=record.id
          break;

          case 'renting':
            this.order.returnTools=record.id;
          break;
        }
        return this.order;
      })
    })
  }

  /** update */
  private _refreshView(){
    //check
         //check some condition
    if(this.auth.currentUser.id==this.order.user.id) this.isOwner=true;
    if(this.auth.currentUser.role=='admin') this.isAdmin=true;
    if(this.CAN_EDIT_LIST.includes(this.order.status)) {this.isEdit=true;this.isSave=true}
    this.isAvailable=true;
  }

  exportTools(){
    console.log("export");
    const tools=this.order.tools;
    console.log("TEST",{tools});
    const toolList=getList(tools,"name");
    const toolsExt=toolList.map(tool=>{
      const ts=tools.filter(t=>t.name==tool);
      let image=ts[0].images[0].url
      if(!image) image='../../../assets/image/no-image.png';
      return {image,name:tool,qty:ts.length,modelId:ts[0].modelId}
    })
    
    let trs=toolsExt.map((tool,pos)=>
      `<tr>
        <td>${pos+1}</td>
        <td> <img src="${tool.image}"/></td>
        <td> <h3>${tool.name}</h3>
        <p>${tool.modelId?tool.modelId:""}</p>
        </td>
        <td>${tool.qty}</td>
        <td></td>
      </tr>`  
    );
    const tbl=`<table><thead>
          <th>No</th>
          <th>Picture</th>
          <th>Part Name</th>
          <th>Qty</th>
          <th>Remark </th>
          </thead>
          <tbody>
            ${trs.join("")}
          </tbody>
        </table>`;
    const title=`
      <div class='title-group'>
        <h1 class='title'>TOOL LIST</h1>
        <div class='inf-group'>
          <div class='inf'>
            <div><b>Purpose:</b> ${this.order.purpose}</div>
            <div><b>Create date:</b> ${this.order.createAt.substring(0,10)}</div>
            <div><b>schedule start:</b> ${this.order.scheduleStart.substring(0,10)}</div>
            <div><b>Schedule return:</b> ${this.order.scheduleFinish.substring(0,10)}</div>
          </div>
          <div>
            <div id="qr-code"></div>
            <div class="code">${this.order.id}</div>
          </div>
        </div>
      </div>
    `
    const style=`
      .inf-group {
        display: flex;
        flex-direction: row;
      }
      .code {
        font-size: 0.5rem;
        margin-top: 6px;
      }
      .inf {
        /* width: calc(100% - 50px); */
        padding-right: 32px;
        max-width: 100%;
        min-width: 400px;
      }
      img{
        width:150px;height:100px;aspect-ratio: 4/3;object-fit:contain;
      }
      table {
        border-collapse: collapse;
        border: 1px solid;
      }
      td,th {
        padding: 5px 12px;
        border: 1px solid;;
      }

    `
    const html=`<html><head> <style> ${style}</style></head><body>${title} ${tbl}</body><html>`
    const windowXp=window.open('','',`left=0,top=0,width=700px,height=500px`);
    windowXp.document.write(html);
    const codePng:string=this.util.code2Image(this.order.id,{type:'order',scale:2})
    windowXp.document.querySelector('#qr-code').innerHTML=`<img src='${codePng}'/>`
    // this.util.exportQRcode(this.order.id,_qrElement,{type:'order',size:42})

  }

}


////////// INPUT/OUTUT interface ///////////////////

/**
 * @param infor Booking information, default=createNew
 * @param inforId booking information id, default=createNew
 * @param isEdit  enable edit or not
 */
export interface BookingPageOpts{
  order?:OrderData;
  inforId?:string;
  isEdit?:boolean;
}

export interface BookingPageOuts{
  order:OrderData
}

export declare type BookingPageRoleType="save"|"cancel"|'delete'|'back'

/** include object */
function checkIncludeObj<T>(arrs1:T[],arrs2:T[],keys:string[]=['id'],type:'All keys'|'One key'='All keys'):T[]{
  if(!arrs1||!arrs2) return [];//not exist
  if(!arrs1.length|| !arrs2.length) return []//not include
  if(!keys || !keys.length) keys=Object.keys(arrs1)
  if(type=='All keys'){
    return arrs1.filter(arr1=>arrs2.find(arr2=>keys.every(key=>arr1[key]==arr2[key])))
  }
  if(type=='One key') return arrs1.filter(arr1=>arrs2.find(arr2=>keys.some(key=>arr1[key]==arr2[key])))
  console.error("checkIncludeObj\nOut of case");
  return []
}

function  getChildren(covers:CoverData[],children:ChildData[]):ChildData[]{
  children=covers.reduce((acc,curr)=>[...acc,...curr.childrenId],children)
  //add more cover
  children=[...children,...covers.map(x=>{const child:ChildData={id:x.id,type:'cover'}; return child})]
  // remove duplicate
  const outs:ChildData[]=[];
  children.forEach(child=>{
    if(outs.find(o=>o.id==child.id && o.type==child.type)) return;//already
    outs.push(child)
  })
  return outs;
}


interface ConflictToolData {
  children:ChildData[];
  order:OrderData;
}

// function status(stt,type:BasicDataType='tool'):'Not Check'|'OK'|'NG'{
//   const keys=statusList[type]
//   const notCheck:boolean=keys.some(key=>stt[key]==1)
//   if(notCheck) return 'Not Check'
//   const value:number=keys.reduce((acc,curr)=>acc+stt[curr],0)
//   return value?'NG':'OK'
// }

function getNotCheckStatus(statusRecord:StatusRecord):boolean{
   const stt:StatusInf[]=statusRecord.data.reduce((acc,cur)=>[...acc,cur.status],[])
  return stt.some(s=>s.value==_STATUS_NOTYET.value)
}