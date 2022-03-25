import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {  ChildData } from 'src/app/models/basic.model';
import { BookingInfor, createBookingInfor, _DB_INFORS } from 'src/app/models/bookingInfor.model';
import { CompanyData, _DB_COMPANY } from 'src/app/models/company.model';
import { CoverData, getCovers, _DB_COVERS } from 'src/app/models/cover.model';
import { _DB_TOOLS } from 'src/app/models/tools.model';
import { UserData, _DB_USERS } from 'src/app/models/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { SearchCompanyPage, SearchCompanyPageOpts, SearchCompanyPageOuts, SearchCompanyPageRole } from '../search-company/search-company.page';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts, SearchToolPageRole } from '../search-tool/search-tool.page';



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
  users:Object;
  selected:ChildData[]=[];
  company:CompanyData;
  /** control variable */
  isAvailable:boolean=false;
  isAdmin:boolean=false;
  isOwner:boolean=false;
  isEdit:boolean=false;
  backup:string=''
  // isChange:boolean=false;
  constructor(
    private auth:AuthService,
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService
  ){ }

  ngOnInit() {
    this._getInfor()
    .then(infor=>{
      this.infor=infor;
      this.inforId=infor.id;
      return this._getUsers()
    })
    .then((users)=>{
      this.users=users;
      this.backup=JSON.stringify(this.infor);

      if(this.infor.companyId){
        return this.db.get(_DB_COMPANY,this.infor.companyId)
        .then((company:CompanyData)=>this.company=company)
      }
      return null;
    })
    .then(()=>this._update())
    .catch(err=>console.log("\n#### ERROR[1]: get data error",err))
  }

  
  //////////////// Hander buttons /////////////////

  /** exist */
  done(role:BookingPageRoleType='save'){
    const data:BookingPageOuts={
      infor:this.infor
    }
    this.modal.dismiss(data,role)
  }

  /** add more tool */
  pickupTool(){
    const props:SearchToolPageOpts={exceptionList:this.infor.scheduleTools}
    this.disp.showModal(SearchToolPage,props)
    .then(result=>{
      const role=result.role as SearchToolPageRole;
      const data=result.data as SearchToolPageOuts
      if(role=='save'){
        this.infor.scheduleTools=[...this.infor.scheduleTools,...data.search]
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
        console.log("company ID:",data.companyIds);
        this.infor.companyId=data.companyIds[0];
        this.db.get(_DB_COMPANY,data.companyIds[0])
        .then((c:CompanyData)=>{this.company=c})
        return;
      }
    })
  }

  /** book */
  async book(){
    if(!this._verify()) return;
    this._checkConflict()
    .then(async conflicts=>{
      console.log("\ncheck[4]: conflict tools\n",conflicts)
      if(conflicts.length) return this.disp.msgbox("conflict data, pls check<br>")
      this.infor.status='created';
      this.done('save');
    })
    // this.done('save');//test
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
      const i=this.infor.scheduleTools.findIndex(s=>s.id==select.id&&s.type==select.type)
      if(i==-1) return console.log("\n### ERROR: not exist %s '%s'",select.type,select.id)
      this.infor.scheduleTools.splice(i,1)
    })
    this.selected=[];
  }

  ///// backgroup function /////////////////////

  /** verify input true=OK */
  private _verify():boolean{
    if(!this.infor.companyId) {
      this.disp.msgbox("pls select company");
      return false;
    }
    if(!this.infor.purpose){
      this.disp.msgbox("pls input purpose");
      return false;
    }
    if(!this.infor.scheduleStart){
      this.disp.msgbox("pls select schedule start");
      return false;
    }
    if(!this.infor.scheduleFinish){
      this.disp.msgbox("pls select schedule finish");
      return false;
    }
    if(!this.infor.scheduleTools.length){
      this.disp.msgbox("missing pickup tools/jigs");
      return false;
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
            // console.log("check to ", infor);
            if (!infor) { console.log("\n###ERROR[1]: data is empty"); return false; }
            //remove current infor
            if(infor.id==this.infor.id) return false;
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
          if(!infors.length) return []
          const allCovers=await this.db.search(_DB_COVERS,[]);
          //calculete current tool
          let _children:ChildData[]=this.infor.scheduleTools.map(x=>{return{id:x.id,type:x.type}})
          const _covers:CoverData[]=getCovers(_children,allCovers,[])
          _children=getChildren(_covers,_children)
          let _duplicateChildren:ConflictToolData[]=[];
          infors.forEach(infor=>{
            let children:ChildData[]=(infor.status=='created'||infor.status=='approved')?infor.scheduleTools:infor.checkingTools
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

  /** get users from infor */
  private _getUsers():Promise<Object>{
    return new Promise((resolve,reject)=>{
      const list=["userId","approvedBy","checkingManId","returnManId"]
      const obj=getObjectFromList(this.infor,list);
      console.log("infor:",{infor:this.infor,list,obj})
      const all=Object.keys(obj).filter(x=>obj[x]) //remove not id
      .map(key=>{
        return this.db.get(_DB_USERS,obj[key]+"")
        .then((user:UserData)=>{return {key,user}})
      }).filter(x=>x)

      return Promise.all(all).then(results=>{
        const outs:Object={}
        results.forEach((result)=>{
          outs[result.key]=result.user
        })
        return resolve(outs);
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
    if(this.infor.status=='new'||this.infor.status=='created') this.isEdit=true;
    this.isAvailable=true;
  }

}


////////// INPUT/OUTUT interface ///////////////////

/**
 * @param infor Booking information, default=createNew
 * @param inforId booking information id, default=createNew
 */
export interface BookingPageOpts{
  infor?:BookingInfor
  inforId?:string;
}

export interface BookingPageOuts{
  infor:BookingInfor
}

export declare type BookingPageRoleType="save"|"cancel"|'delete'



/////// extend functions /////////////
function getObjectFromList(obj:object,list:string|string[]):object{
  const outs:object={}
  const _list=[].concat(list);
  _list.forEach(key=>{
    if(obj[key]==undefined) return;
    outs[key]=obj[key]
  })
  return outs;
}

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

function getChildren(covers:CoverData[],children:ChildData[]):ChildData[]{
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