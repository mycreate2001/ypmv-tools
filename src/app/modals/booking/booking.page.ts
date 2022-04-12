import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {  BasicData, BasicDataType, ChildData, createBasicData } from 'src/app/models/basic.model';
import { ApprovedResultType, BookingInfor, BookingInforStatusType, CheckData, createBookingInfor, createCheckData, _DB_INFORS, _STORAGE_INFORS } from 'src/app/models/bookingInfor.model';
import { CodeFormatConfig } from 'src/app/models/codeformat';
import {  _DB_COMPANY } from 'src/app/models/company.model';
import { CoverData, createCoverData, getCovers, _DB_COVERS } from 'src/app/models/cover.model';
import { createToolData, createToolStatus, ModelData, statusList, ToolData, ToolStatusOpts, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import {  _DB_USERS } from 'src/app/models/user.model';
import { UrlData } from 'src/app/models/util.model';
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
  infor:BookingInfor;
  inforId:string='';

  /** internal variable */
  selected:ChildData[]=[];
  temImages:Object={};
  /** control variable */
  isAvailable:boolean=false;
  isAdmin:boolean=false;
  isOwner:boolean=false;
  isEdit:boolean=false;
  isSave:boolean=false;
  conflictList:string[]=[];
  code:string;
  cancelList:BookingInforStatusType[]=['created','approved']
  scanList:BookingInforStatusType[]=['approved','renting']
  approveList:BookingInforStatusType[]=['approved','renting','rejected','returned']
  returnList:BookingInforStatusType[]=['renting'];
  showStatusList:BookingInforStatusType[]=['approved','renting','returned']
  // isChange:boolean=false;
  constructor(
    private auth:AuthService,
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService,
    private util:UtilService,
    private storage:StorageService
  ){ }

  ngOnInit() {
    this._getInfor()
    .then(infor=>{
      this.infor=infor;
      this.inforId=infor.id;
      console.log("Initial",this);
      this._update()
    })
    .catch(err=>console.log("\n#### ERROR[1]: get data error",err))
  }

  
  //////////////// Hander buttons /////////////////
  /** check tool status */
  toolStatus(tool:CheckData){
    const data=this.temImages[tool.id]||{}
    const addImages:UrlData[]=data.addImages||[]
    const delImages:string[]=data.delImages||[]
    const props:ToolStatusPageOpts={
      tool,
      addImages,
      delImages,
      status:this.infor.status
    }
    this.disp.showModal(ToolStatusPage,props)
    .then(result=>{
      const data=result.data as ToolStatusPageOuts
      const role=result.role as ToolStatusPageRole;
      console.log("data",{result})
      if(role=='save'){
        ///
        this.temImages[tool.id]={addImages:data.addImages,delImages:data.delImages}
        const pos=this.infor.tools.findIndex(x=>x.id==tool.id&&x.type==tool.type)
        if(pos==-1) return console.warn("\n#### ERRROR ####\ndata wrong",{result})
        this.infor.tools[pos]=data.tool
      }
    })
  }

  /** QR code */
  printCode(){
    this.util.generaQRcode(this.infor.id,{label:this.infor.purpose,size:42,type:'booking'})
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
      const tools=this.infor.tools.filter(x=>x.id==code)
      if(tools.length>1) return console.warn("\n### ERROR[1]: code is doudle")
      this.toolStatus(tools[0])
    })
  }

  /** exist */
  done(role:BookingPageRoleType='save'){
    const data:BookingPageOuts={
      infor:this.infor
    }
    this.modal.dismiss(data,role)
  }

  /** add more tool */
  pickupTool(){
    const props:SearchToolPageOpts={exceptionList:this.infor.tools.map(x=>{return{id:x.id,type:x.type}})}
    this.disp.showModal(SearchToolPage,props)
    .then(result=>{
      const role=result.role as SearchToolPageRole;
      const data=result.data as SearchToolPageOuts
      if(role=='ok'){
        // const tools=data.search.map(tool=>createCheckData({...tool}))
        // this.infor.tools=[...this.infor.tools,...tools]
        // console.log("TEST after picking up tool,",{tools,inforTools:this.infor.tools})
        // return;
        this.conflictList=[];
        this._getToolfromPickup(data.search)
        .then(tools=>{
          this.infor.tools=this.infor.tools.concat(tools.map(tool=>createCheckData({...tool})))
        })
      }
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
        this.infor.companyId=data.companyIds[0];
        return;
      }
    })
  }

  /** book */
  async book(){
    if(!this._verify()) return;
    console.log("check[0]: verify is ok")
    this._checkConflict()
    .then(conflicts=>{
      console.log("\ncheck[4]: conflict tools\n",conflicts)
      this.conflictList=conflicts.reduce((acc,cur)=>[...acc,...cur.children],[]).map(x=>x.type+x.id)
      console.log("configlist:",this.conflictList)
      if(conflicts.length) return this.disp.msgbox("conflict data, pls check")
      this.infor.status='created';
      this.db.add(_DB_INFORS,this.infor)
      this.done();
    })
    // this.done('save');//test
  }

  async rent(){
    //verify data
    if(this.infor.status!='approved') return this.disp.msgbox("wrong data")
    if(this.infor.approvedResult!='Accept') return this.disp.msgbox("these tools not accept to rent")
    const notCheck:boolean=this.infor.tools.some(tool=>status(tool.beforeStatus,tool.type)=='Not Check')
    if(notCheck) return this.disp.msgbox("Tool not yet complete check status<br> pls check status of all tools")
   
    //------ updatetool stay ----------------//
    let list:string[]=this.infor.tools.filter(x=>x.type=='cover').map(x=>x.id)

    const covers:CoverData[]=await this.db.gets(_DB_COVERS,list)
    covers.forEach(cover=>{
      cover.stay=this.infor.companyId;
      this.db.add(_DB_COVERS,cover)
    })
    list=this.infor.tools.filter(x=>x.type=='tool').map(x=>x.id)
    const tools:ToolData[]=await this.db.gets(_DB_TOOLS,list);
    tools.forEach(tool=>{
      tool.stay=this.infor.companyId;
      this.db.add(_DB_TOOLS,tool)
    })
    //----------- save data -------------//
    const infor=await this._updateImage()           // update images
    infor.checkingDate=new Date().toISOString();    // checking date
    infor.checkingManId=this.auth.currentUser.id;   // ypmv checking main
    infor.checkingAgencyName=''                     // @@@
    infor.checkingAgencyId=''                       // @@@
    infor.status='renting';                         // status
    this.db.add(_DB_INFORS,infor)                   // upload
    this.done();
  }
  

  /** approved */
  approve(){
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
        this.infor.approvedResult=role=='ACCEPT'?'Accept':'Reject'  // result
        this.infor.status='approved'                                // status
        this.infor.approvedBy=this.auth.currentUser.id              // auth
        this.infor.approvedComment=result.data.values[0]            // comment
        this.infor.approvedDate=new Date().toISOString()            // date
        console.log('test',this.infor)
        this.db.add(_DB_INFORS,this.infor)
        this.done();
        return;
      }
      
    })
  }

  /** cancel */
  cancel(){
    //check infor
    if(!this.cancelList.includes(this.infor.status)) return this.disp.msgbox("cannot cancel this booking")
    this.infor.status='cancel'
    this.db.add(_DB_INFORS,this.infor)
    this.done();
  }

  /** delete booking (admin only) */
  delete(){
    //delete images
    const images:string[]=this.infor.tools.reduce((acc,curr)=>[...acc,...curr.beforeImages.map(x=>x.url),...curr.afterImages.map(x=>x.url)],[])
    console.log("\n---test---",{images})
    images.forEach(image=>this.storage.delete(image))
    this.db.delete(_DB_INFORS,this.infor.id);
    this.done();
  }

  /** returning tools/jigs to YPMV */
  async returning(){
    //check condition
    console.log("returning tools/jigs")
    if(this.infor.status!='renting') return console.warn("wrong status/process")
    const notCheck:boolean=this.infor.tools.some(tool=>status(tool.afterStatus,tool.type)=='Not Check')
    if(notCheck) return this.disp.msgbox("Tool not yet complete check status<br> pls check status of all tools")
    //---------- change stay -----------------//
    const coversId=this.infor.tools.filter(x=>x.type=='cover').map(x=>x.id)
    this.db.gets(_DB_COVERS,coversId)
    .then((covers:CoverData[])=>{
      covers.forEach(cover=>{
        cover.stay=''
        this.db.add(_DB_COVERS,cover)
      })
    })

    const toolsId=this.infor.tools.filter(x=>x.type=='tool').map(x=>x.id)
    this.db.gets(_DB_TOOLS,toolsId).then((tools:ToolData[])=>{
      tools.forEach(tool=>{
        tool.stay=''//return tool
        this.db.add(_DB_TOOLS,tool)
      })
    })

    //------------- save information --------//
    const infor=await this._updateImage();
    infor.returnAgencyName=''//@@@
    infor.returnAgencyId=''  //@@@
    infor.returnDate=new Date().toISOString();
    infor.returnManId=this.auth.currentUser.id;
    infor.status='returned';
    this.db.add(_DB_INFORS,infor)
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
      const i=this.infor.tools.findIndex(s=>s.id==select.id&&s.type==select.type)
      if(i==-1) return console.log("\n### ERROR: not exist %s '%s'",select.type,select.id)
      this.infor.tools.splice(i,1)
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
      outs.push(createBasicData({id:tool.id,type:'tool',...model}))
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
    list=list.filter(item=>Array.isArray(this.infor[item.key])?!this.infor[item.key].length:!this.infor[item.key])
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
    const cList:BookingInforStatusType[]=['returned','rejected','cancel']
    return new Promise((resolve, reject) => {
      const a= this.db.search(_DB_INFORS, { key: 'status', type: 'not-in', value: cList })
        //check time
        .then((infors:BookingInfor[]) => {
          // console.log("\ncheck[2]: get booking Infor from DB, status<>'returned'\n", { infors })
          //check time
          const _start = new Date(this.infor.scheduleStart);
          const _finish = new Date(this.infor.scheduleFinish);
          //filter -- 
          return infors.filter(infor => {
            if (!infor) { console.log("\n###ERROR[1]: data is empty"); return false; }
            if(infor.id==this.infor.id) return false;//current booking
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
        .then(async infors=>{
          console.log("\ncheck[3]: infors after filting date\n",{infors})
          if(!infors.length) return []  //completed
          const allCovers=await this.db.search(_DB_COVERS,[]);
          //calculete current tool
          let _children:ChildData[]=this.infor.tools.map(x=>{return{id:x.id,type:x.type}})
          const _covers:CoverData[]=getCovers(_children,allCovers,[])
          _children=getChildren(_covers,_children)
          let _duplicateChildren:ConflictToolData[]=[];
          infors.forEach(infor=>{
            let children:ChildData[]=infor.tools;
            const covers:CoverData[]=getCovers(children,allCovers,[])
            children=getChildren(covers,children)
            const list=checkIncludeObj(_children,children,['id','type'],"All keys")
            if(!list.length) return;// OK
            _duplicateChildren.push({children:list,infor})
          })
          return _duplicateChildren
        })
        // .catch(err=>reject(err))
      return resolve(a)

    })
  }

  /** get booking infor */
  private _getInfor():Promise<BookingInfor>{
    return new Promise((resolve,reject)=>{
      if(!this.infor && !this.inforId){//new case
        const auth=this.auth.currentUser
        const infor=createBookingInfor({userId:auth.id,companyId:auth.companyId});
        return resolve(infor)
      }
      if(this.infor){
        return resolve(this.infor)
      }
      this.db.get(_DB_INFORS,this.inforId)
      .then((infor:BookingInfor)=>resolve(infor))
      .catch(err=>reject(err))
    })
  }

  /** upload all images */
  private _updateImage():Promise<BookingInfor>{
    const stt=this.infor.status;
    return new Promise((resolve,reject)=>{
      const all=this.infor.tools.map(tool=>{
        return this._uploadEachImage(tool.id)
        .then(urls=>{
          if(stt=='approved') tool.beforeImages=urls;
          else if(stt=='renting') tool.afterImages=urls;
          return tool
        })
      })
      Promise.all(all).then(tools=>{
        this.infor.tools=tools;
        return resolve(this.infor)
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
      this.storage.uploadImages(addImages,_STORAGE_INFORS)
      .then(urls=>{
        const a=urls.map(url=>typeof url=='string'?{url:url,caption:''}:url)
        return resolve(a);
      })
      .catch(err=>reject(err))
    })
  }

  /** update */
  private _update(){
    //check
         //check some condition
    if(this.auth.currentUser.id==this.infor.userId) this.isOwner=true;
    if(this.auth.currentUser.role=='admin') this.isAdmin=true;
    if(this.infor.status=='new'||this.infor.status=='created') {this.isEdit=true;this.isSave=true}
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
  infor?:BookingInfor
  inforId?:string;
  isEdit?:boolean;
}

export interface BookingPageOuts{
  infor:BookingInfor
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
  infor:BookingInfor;
}

function status(stt,type:BasicDataType='tool'):'Not Check'|'OK'|'NG'{
  const keys=statusList[type]
  const notCheck:boolean=keys.some(key=>stt[key]==1)
  if(notCheck) return 'Not Check'
  const value:number=keys.reduce((acc,curr)=>acc+stt[curr],0)
  return value?'NG':'OK'
}