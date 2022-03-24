import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasicData, ChildData } from 'src/app/models/basic.model';
import { BookingInfor, BookingInforStatusType, createBookingInfor, _DB_INFORS } from 'src/app/models/bookingInfor.model';
import { CompanyData, _DB_COMPANY } from 'src/app/models/company.model';
import { CoverData, getCovers, _DB_COVERS } from 'src/app/models/cover.model';
import { UserData, _DB_USERS } from 'src/app/models/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService, QueryData } from 'src/app/services/firebase/firestore.service';
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

  /** control variable */
  isAvailable:boolean=false;
  companies:CompanyData[]=[];
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
      this._update();
    })
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

  /** book */
  async book(){
    //search data base for tools/cover interfer or not (confict)
    console.log('infor:',this.infor);
    const status:BookingInforStatusType[]=['Created','Approved','Renting','Returned']
    let queries:QueryData[]=[
      {key:'status',compare:'in',value:['Created','Approved']},
      {key:'scheduleStart',compare:'<=',value:this.infor.scheduleStart},
      // {key:'scheduleFinish',compare:'>=',value:this.infor.scheduleStart}
    ]
    //booking still open
    const infors1:BookingInfor[]= await this.db.search(_DB_INFORS,queries);
    console.log("infor1:",infors1);
    // queries=[
    //   {key:'status',compare:'in',value:['Created','Approved']},
    //   {key:'scheduleStart',compare:'>=',value:this.infor.scheduleStart},
    //   {key:'scheduleStart',compare:'<=',value:this.infor.scheduleFinish}
    // ]
    // const infors2:BookingInfor[]= await this.db.search(_DB_INFORS,queries);
    // queries=[
    //   {key:'status',compare:'==',value:'Renting'},
    //   {key:'checkingDate',compare:'<=',value:this.infor.scheduleStart},
    //   {key:'scheduleFinish',compare:'>=',value:this.infor.scheduleStart}
    // ]
    // const infors3:BookingInfor[]= await this.db.search(_DB_INFORS,queries);

    // const infors=[...infors1,...infors2,...infors3];
    // console.log("check[1]: infors:",infors);
    // check confict date

    // // filter tools same
    // console.log("check[0]:infors",infors);
    // let children=this.infor.scheduleTools;
    // let covers:CoverData[]=await this.db.search(_DB_COVERS,[]);
    // console.log("check[1]:covers",covers);
    // covers=getCovers(children.filter(x=>x.type=='cover'),covers,[]);
    // console.log("check[2]:All covers",covers);
    // //all tools
    // let toolsId=[...this.infor.scheduleTools.filter(x=>x.type=='tool').map(x=>x.id)];
    // toolsId=covers.reduce((acc,cur)=>[...acc,...cur.childrenId.map(x=>x.id)],toolsId);
    // console.log("check[3]: All tools:",toolsId.join(","));
  }

  ///// backgroup function /////////////////////


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

export declare type BookingPageRoleType="save"|"cancel"



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