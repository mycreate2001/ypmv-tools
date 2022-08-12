import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {  BasicData, BasicDataType, ChildData, createBasicData } from 'src/app/models/basic.model';
import { CheckData, createCheckData, createOrderData, OrderData, OrderDataStatusType, _DB_ORDERS, _STORAGE_ORDERS } from 'src/app/models/order.model';
import { CodeFormatConfig } from 'src/app/models/codeformat';
import {  _DB_COMPANY } from 'src/app/models/company.model';
import { CoverData, getCovers, _DB_COVERS } from 'src/app/models/cover.model';
import { ModelData, statusList, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import {  _DB_USERS } from 'src/app/models/user.model';
import { createUrlData, UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { UtilService } from 'src/app/services/util/util.service';
import { getList } from 'src/app/utils/minitools';
import { QrcodePage, QRcodePageOpts, QRcodePageOuts, QRcodePageRole } from '../qrcode/qrcode.page';
import { SearchCompanyPage, SearchCompanyPageOpts, SearchCompanyPageOuts, SearchCompanyPageRole } from '../search-company/search-company.page';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts, SearchToolPageRole } from '../search-tool/search-tool.page';
import { ToolStatusPage, ToolStatusPageOpts, ToolStatusPageOuts, ToolStatusPageRole } from '../tool-status/tool-status.page';

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
  temImages:Object={};
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
      console.log("Initial",this);
      this._refreshView()
    })
    .catch(err=>console.log("\n#### ERROR[1]: get data error",err))
  }

  
  //////////////// BUTTONS HANDLERS /////////////////

  /** check tool status */
  toolStatus(tool:CheckData){
    const data=this.temImages[tool.id]||{}
    const addImages:UrlData[]=data.addImages||[]
    const delImages:string[]=data.delImages||[]
    const props:ToolStatusPageOpts={
      tool,
      addImages,
      delImages,
      status:this.order.status
    }
    this.disp.showModal(ToolStatusPage,props)
    .then(result=>{
      const data=result.data as ToolStatusPageOuts
      const role=result.role as ToolStatusPageRole;
      console.log("data",{result})
      if(role=='save'){
        ///
        this.temImages[tool.id]={addImages:data.addImages,delImages:data.delImages}
        const pos=this.order.tools.findIndex(x=>x.id==tool.id&&x.type==tool.type)
        if(pos==-1) return console.warn("\n#### ERRROR ####\ndata wrong",{result})
        this.order.tools[pos]=data.tool
      }
    })
  }

  /** QR code */
  printCode(){
    this.util.generaQRcode(this.order.id,{label:this.order.purpose,size:42,type:'order'})
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
      if(tools.length>1) return console.warn("\n### ERROR[1]: code is doudle")
      this.toolStatus(tools[0])
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
    const props:SearchToolPageOpts={exceptionList:this.order.tools.map(x=>{return{id:x.id,type:x.type}})}
    this.disp.showModal(SearchToolPage,props)
    .then(result=>{
      const role=result.role as SearchToolPageRole;
      if(role!=='ok') return; // not select
      const data=result.data as SearchToolPageOuts
      this.conflictList=[];
      this._getToolfromPickup(data.search)
      .then(tools=>{
        this.order.tools=this.order.tools.concat(tools.map(tool=>createCheckData({...tool})))
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
        this.order.companyId=data.companyIds[0];
        return;
      }
    })
  }

  /** book */
  async book(){
    if(!this.CAN_BOOK_LIST.includes(this.order.status)) return; // check status can book
    if(!this._verify()) return;
    this._checkConflict()
    .then(conflicts=>{
      this.conflictList=conflicts.reduce((acc,cur)=>[...acc,...cur.children],[]).map(x=>x.type+x.id)
      console.log("configlist:",this.conflictList)
      if(conflicts.length) return this.disp.msgbox("Some tools/jigs are not available")
      this.order.status='created';
      this.db.add(_DB_ORDERS,this.order)
      this.done();
    })
    // this.done('save');//test
  }

  async rent(){
    //verify data
    if(!this.CAN_RENT_LIST.includes(this.order.status)) return this.disp.msgbox("wrong data");
    if(this.order.approvedResult!='Accept') return this.disp.msgbox("these tools not accept to rent")
    const notCheck:boolean=this.order.tools.some(tool=>status(tool.beforeStatus,tool.type)=='Not Check')
    if(notCheck) return this.disp.msgbox("Tool not yet complete check status<br> pls check status of all tools")
   
    //------ updatetool stay ----------------//
    let list:string[]=this.order.tools.filter(x=>x.type=='cover').map(x=>x.id)

    const covers:CoverData[]=await this.db.gets(_DB_COVERS,list)
    covers.forEach(cover=>{
      cover.stay=this.order.companyId;
      this.db.add(_DB_COVERS,cover)
    })
    list=this.order.tools.filter(x=>x.type=='tool').map(x=>x.id)
    const tools:ToolData[]=await this.db.gets(_DB_TOOLS,list);
    tools.forEach(tool=>{
      tool.stay=this.order.companyId;
      this.db.add(_DB_TOOLS,tool)
    })

    //----------- save data -------------//
    const infor=await this._refreshViewImage()           // update images
    infor.checkingDate=new Date().toISOString();    // checking date
    infor.checkingManId=this.auth.currentUser.id;   // ypmv checking main
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
      //delete images
      const images:string[]=this.order.tools.reduce((acc,curr)=>[...acc,...curr.beforeImages.map(x=>x.url),...curr.afterImages.map(x=>x.url)],[])
      console.log("\n---test---",{images})
      images.forEach(image=>this.storage.delete(image))
      this.db.delete(_DB_ORDERS,this.order.id);
      this.done('delete');
    })
    
  }

  /** returning tools/jigs to YPMV */
  async returning(){
    //check condition

    if(!this.CAN_RETURN_LIST.includes(this.order.status)) return console.warn("wrong status/process")
    const notCheck:boolean=this.order.tools.some(tool=>status(tool.afterStatus,tool.type)=='Not Check')
    if(notCheck) return this.disp.msgbox("Tool not yet complete check status<br> pls check status of all tools")
    //---------- change stay -----------------//
    const coversId=this.order.tools.filter(x=>x.type=='cover').map(x=>x.id)
    this.db.gets(_DB_COVERS,coversId)
    .then((covers:CoverData[])=>{
      covers.forEach(cover=>{
        cover.stay=''
        this.db.add(_DB_COVERS,cover)
      })
    })

    const toolsId=this.order.tools.filter(x=>x.type=='tool').map(x=>x.id)
    this.db.gets(_DB_TOOLS,toolsId).then((tools:ToolData[])=>{
      tools.forEach(tool=>{
        tool.stay=''//return tool
        this.db.add(_DB_TOOLS,tool)
      })
    })

    //------------- save information --------//
    const infor=await this._refreshViewImage();
    infor.returnAgencyName=''//@@@
    infor.returnAgencyId=''  //@@@
    infor.returnDate=new Date().toISOString();
    infor.returnManId=this.auth.currentUser.id;
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
    console.log('check[1]: iTools:',{iTools})
    const children=await this._getchildren(iTools,[]);
    console.log('check[2] _getChildren:',{children}) 
    const tools:ToolData[]=await this.db.gets(_DB_TOOLS,children.filter(x=>x.type=='tool').map(x=>x.id));
    const models:ModelData[]=await this.db.gets(_DB_MODELS,getList(tools,"model"))
    const covers:CoverData[]=await this.db.gets(_DB_COVERS,children.filter(x=>x.type=='cover').map(x=>x.id));
    console.log('check[3] covers,tools,models:',{covers,tools,models}) 
    const outs:BasicData[]=[];
    //tools
    tools.forEach(tool=>{
      const model=models.find(m=>m.id==tool.model);
      if(!model) return console.log("\n### ERROR: cannot find model '%s' from db",tool.model)
      outs.push(createBasicData({...model,id:tool.id,type:'tool'}))
    })

    //cover
    covers.forEach(cover=>{
      outs.push(createBasicData({...cover,type:'cover'}))
    })
    console.log('check[4] finish',{outs}) 
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

  /**
   * check conflict tools & data
   * @returns conflict Information
   */
  private _checkConflict():Promise<ConflictToolData[]> {
    // console.log('\ncheck[1]: start to check', { infor: this.infor });
    const cList:OrderDataStatusType[]=['returned','rejected','cancel']
    return new Promise((resolve, reject) => {
      const a= this.db.search(_DB_ORDERS, { key: 'status', type: 'not-in', value: cList })
        //check time
        .then((orders:OrderData[]) => {
          // console.log("\ncheck[2]: get booking Infor from DB, status<>'returned'\n", { infors })
          //check time
          const _start = new Date(this.order.scheduleStart);
          const _finish = new Date(this.order.scheduleFinish);
          //filter -- 
          return orders.filter(infor => {
            if (!infor) { console.log("\n###ERROR[1]: data is empty"); return false; }
            if(infor.id==this.order.id) return false;//current booking
            let startDate: Date;
            let finishDate: Date;
            if (infor.status == 'created' || infor.status == 'approved') {
              startDate = new Date(infor.scheduleStart)
              finishDate = new Date(infor.scheduleFinish)
            }
            else if (infor.status == 'renting') {
              startDate = new Date(infor.checkingDate);
              finishDate = new Date(infor.scheduleFinish)
            }
            else { console.log("#\n### ERROR[2]: Out of case"); return false; }
            if (_start >= startDate && finishDate >= _start) { return true; }
            if (startDate >= _start && startDate <= _finish) { return true; }
            return false;
          })     
        })
        //check tool
        .then(async orders=>{
          console.log("\ncheck[3]: infors after filting date\n",{orders})
          if(!orders.length) return []  //completed
          const allCovers=await this.db.search(_DB_COVERS,[]);
          //calculete current tool
          let _children:ChildData[]=this.order.tools.map(x=>{return{id:x.id,type:x.type}})
          const _covers:CoverData[]=getCovers(_children,allCovers,[])
          _children=getChildren(_covers,_children)
          let _duplicateChildren:ConflictToolData[]=[];
          orders.forEach(order=>{
            let children:ChildData[]=order.tools;
            const covers:CoverData[]=getCovers(children,allCovers,[])
            children=getChildren(covers,children)
            const list=checkIncludeObj(_children,children,['id','type'],"All keys")
            if(!list.length) return;// OK
            _duplicateChildren.push({children:list,order})
          })
          return _duplicateChildren
        })
        // .catch(err=>reject(err))
      return resolve(a)

    })
  }

  /** get booking infor */
  private _init():Promise<{isNew:boolean,order:OrderData}>{
    return new Promise((resolve,reject)=>{
      let isNew:boolean=false;
      // case 1: new case
      if(!this.order && !this.orderId){//new case
        const auth=this.auth.currentUser
        const order=createOrderData({userId:auth.id,companyId:auth.companyId});
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

  /** upload all images */
  private _refreshViewImage():Promise<OrderData>{
    const stt=this.order.status;
    return new Promise((resolve,reject)=>{
      const all=this.order.tools.map(tool=>{
        return this._uploadEachImage(tool.id)
        .then(urls=>{
          if(stt=='approved') tool.beforeImages=urls;
          else if(stt=='renting') tool.afterImages=urls;
          return tool
        })
      })
      Promise.all(all).then(tools=>{
        this.order.tools=tools;
        return resolve(this.order)
      })
      .catch(err=>reject(err))
    })
  }

  private _uploadEachImage(id:string):Promise<UrlData[]>{
    return new Promise((resolve,reject)=>{
      const data:any=this.temImages[id];
      if(!data) return resolve([]);
      const delImages:string[]=data.delImages||[];
      const addImages:UrlData[]=data.addImages||[];
      //delete
      delImages.forEach(this.storage.delete)
      this.storage.uploadImages(addImages,_STORAGE_ORDERS)
      .then(urls=>{
        const a=urls.map(url=>typeof url=='string'?createUrlData({url}):url)
        return resolve(a);
      })
      .catch(err=>reject(err))
    })
  }

  /** update */
  private _refreshView(){
    //check
         //check some condition
    if(this.auth.currentUser.id==this.order.userId) this.isOwner=true;
    if(this.auth.currentUser.role=='admin') this.isAdmin=true;
    if(this.CAN_EDIT_LIST.includes(this.order.status)) {this.isEdit=true;this.isSave=true}
    this.isAvailable=true;
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

function status(stt,type:BasicDataType='tool'):'Not Check'|'OK'|'NG'{
  const keys=statusList[type]
  const notCheck:boolean=keys.some(key=>stt[key]==1)
  if(notCheck) return 'Not Check'
  const value:number=keys.reduce((acc,curr)=>acc+stt[curr],0)
  return value?'NG':'OK'
}