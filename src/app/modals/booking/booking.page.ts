import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {  BasicData, ChildData, createBasicData } from 'src/app/models/basic.model';
import { BookingInfor, CheckData, createBookingInfor, createCheckData, _DB_INFORS, _STORAGE_INFORS } from 'src/app/models/bookingInfor.model';
import { CodeFormatConfig } from 'src/app/models/codeformat';
import {  _DB_COMPANY } from 'src/app/models/company.model';
import { CoverData, getCovers, _DB_COVERS } from 'src/app/models/cover.model';
import { createToolData, createToolStatus, ToolStatusOpts, _DB_TOOLS } from 'src/app/models/tools.model';
import {  _DB_USERS } from 'src/app/models/user.model';
import { UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { UtilService } from 'src/app/services/util/util.service';
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
  code:string;
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
      this._update()
    })
    .catch(err=>console.log("\n#### ERROR[1]: get data error",err))
  }

  
  //////////////// Hander buttons /////////////////
  /** check tool status */
  toolStatus(iTool:CheckData){
    const tool=createBasicData({...iTool})
    const _stt=this.infor.status
    const tmp=this.temImages[iTool.id]
    const addImages=(!tmp||!tmp.addImages)?[]:tmp.addImages;
    const delImages=(!tmp || tmp.delImages)?[]:tmp.delImages;
    const images=_stt=='approved'?iTool.beforeImages:_stt=='renting'?iTool.afterImages:[]
    const status=_stt=='approved'?iTool.beforeStatus:_stt=='renting'?iTool.afterStatus:createToolStatus()
    const props:ToolStatusPageOpts={
      tool,
      addImages,
      delImages,
      images,
      status
    }
    this.disp.showModal(ToolStatusPage,props)
    .then(result=>{
      const data=result.data as ToolStatusPageOuts
      const role=result.role as ToolStatusPageRole;
      console.log("data",{result})
      if(role=='save' && data.isChange){
        ///
        this.temImages[iTool.id]={addImages:data.addImages,delImages:data.delImages}
        if(this.infor.status=='approved') iTool.beforeStatus=data.status;
        this.isSave=true;
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
        const tools=data.search.map(tool=>createCheckData({...tool}))
        this.infor.tools=[...this.infor.tools,...tools]
        console.log("TEST after picking up tool,",{tools,inforTools:this.infor.tools})
        return;
      }
    })
  }

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
    .then(async conflicts=>{
      console.log("\ncheck[4]: conflict tools\n",conflicts)
      if(conflicts.length) return this.disp.msgbox("conflict data, pls check<br>")
      this.infor.status='created';
      this.done('save');
    })
    // this.done('save');//test
  }


  save(){
    const stt=this.infor.status
    const all=this.infor.tools.map(tool=>{
      this.uploadEachImage(tool.id).then(images=>{
        if(stt=='approved') tool.beforeImages=tool.beforeImages.concat(images)
        else if (stt=='renting') tool.afterImages=tool.afterImages.concat(images)
        return;
      })
    })
    Promise.all(all).then(()=>{
      console.log('[save] test-001:infor',this.infor);
      return this.done('save')
    })
    .catch(err=>this.disp.msgbox("Save data error<br>"+err.message))
  }

  uploadEachImage(id:string):Promise<UrlData[]>{
    return new Promise((resolve,reject)=>{
      const data:any=this.temImages[id];
      if(!data) return resolve([]);
      const delImages:string[]=data.delImages||[];
      const addImages:UrlData[]=data.addImages||[];
      //delete
      delImages.forEach(image=>this.storage.delete(image))
      this.storage.uploadImages(addImages,_STORAGE_INFORS)
      .then(urls=>{
        const a=urls.map(url=>typeof url=='string'?{url:url,caption:''}:url)
        return resolve(a);
      })
      .catch(err=>reject(err))
    })
  }

  /** approved */
  approve(decide:boolean){
    this.disp.msgbox(
      "pls input your comment",
      {
        inputs:[{label:'comment',type:'textarea'}],
        buttons:[{text:'OK',role:'ok'},{text:'Cancel',role:'cancel'}],
        mode:'ios'
      }
    )
    .then(result=>{
      console.log("result",result);
      if(result.role.toUpperCase()!='OK') return;
      this.infor.approvedBy=this.auth.currentUser.id;
      this.infor.approvedComment=result.data.values[0];
      this.infor.approvedResult=decide?'Accept':'Reject'
      this.infor.status=decide?'approved':'rejected'
      this.done();
    })
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
  }

  ///// backgroup function /////////////////////

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
    console.log('\ncheck[1]: start to check', { infor: this.infor });
    return new Promise((resolve, reject) => {
      const a= this.db.search(_DB_INFORS, { key: 'status', compare: 'not-in', value: ['returned','rejected'] })
        //check time
        .then((infors:BookingInfor[]) => {
          console.log("\ncheck[2]: get booking Infor from DB, status<>'returned'\n", { infors })
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
        const infor=createBookingInfor({userId:this.auth.currentUser.id});
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

export declare type BookingPageRoleType="save"|"cancel"|'delete'

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