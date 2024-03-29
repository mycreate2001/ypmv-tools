/**
 * [version 0.0.2] 2022-Mar-04
 * - use share database all pages
 * - add function 'onUpdate' for handling data each update times
 * [Version 0.0.1]
 * - use normal ways to connect db
 */
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app'
import { getFirestore,doc,getDoc,getDocs,updateDoc,
         addDoc,collection,deleteDoc,setDoc,connectFirestoreEmulator,
         onSnapshot,
         query,
         where
                                    } from 'firebase/firestore'
import { makeId, uuid } from '../../utils/minitools';
import { Unsubscribe } from 'firebase/auth';
import { getUpdate, UpdateInf } from 'src/app/utils/data.handle';
interface OfflineDbHandler{
  id:string;
  callback:{(data:any[]):any}
}
interface OfflineDb{
  handlers:OfflineDbHandler[];
  ctr:Unsubscribe;
  db:any[];
}

function createOfflineDb(opts:Partial<OfflineDb>={}):OfflineDb{
  const df:OfflineDb={handlers:[],ctr:null,db:[]}
  return Object.assign(df,opts)
}


export interface ConnectData{
  disconnect:Function;
  add:Function;
  get:Function;
  search:Function;
  onUpdate:Function;
  delete:Function;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private _offline:any={};
  private db:any;
  constructor() { 
    const app=initializeApp(environment.firebaseConfig);
    this.db=getFirestore(app);
    // connectFirestoreEmulator(this.db,'http://localhost',8080);//emulator

  }

  /**
   * connect to firestore
   * @param tbl table
   * @returns database
   * @example const userdb=db.connect('users');
   *                userdb.add({userid:'userid',name:'some one',age:21})//add
   *                userdb.get('userid');//get user with id
   *                userdb.onUpdate((users)=>console.log("update users",users)) //handler update data
   *                userdb.disconnect() //disconnet
   */
  connect(tbl:string,debug:boolean=false):ConnectData{
    const that=this;
    let offline:OfflineDb=null;
    let isNeedUpdate:boolean=true;         //first time run
    /** not yet register this db */
    if(!this._offline[tbl]){//not exist
      this._offline[tbl]=createOfflineDb();
      offline=this._offline[tbl];
      // isNew=true;
      offline.ctr=this.monitor(tbl,(added:any[],modified:any[],removed:string[])=>{
        // if(debug) console.log("before update",{db:offline.db,added,modified,removed})

        //handler data
        removed.forEach(id=>del(offline.db,id));
        modified.forEach(m=>{
          const i=offline.db.findIndex(x=>x.id==m.id);
          if(i!=-1) offline.db[i]=m;
        })
        added.forEach(data=>offline.db.push(data));

        // handler events
        if(debug) console.log("table '%s'",tbl,offline.db);
        if(offline && offline.handlers) {
          offline.handlers.forEach(hd=>hd.callback(structuredClone(offline.db)))
        }
        isNeedUpdate=false;
      });
    }
    offline=this._offline[tbl];
    const id=uuid();
    
    //return function
    return{
      /**
       * disconnect with share database
       * @example const userdb=db.connect('users');
       *                userdb.disconnect()
       */
      disconnect(){
        //remove callback
        const pos=offline.handlers.findIndex(x=>x.id==id);
        if(pos!=-1) offline.handlers.splice(pos,1)
        //unsubscribe
        if(!offline.handlers.length){
           offline.ctr();//disconnect
           delete that._offline[tbl]
        }
        if(debug) console.log("'%s' disconnect with '%s'",id,tbl,{globalOffline:that._offline})
      },

      /**
       * add create/update record from firestore
       * @param data record
       * @param debug debug flag
       * @returns promise
       * @example const userdb=db.connect('users');
       *                userdb.add({userid:'abc',name:'some one',age:21})
       */
      async add(data:any,debug){return await that.add(tbl,data,debug)},

      /**
       * get record/data from share database
       * @param id record id
       * @returns record/data
       * @example const userdb=db.connect('users');
       *          const user=userdb.get('abc')
       */
      get(id:string){
        const out=offline.db.find(x=>x.id==id);
        if(!out) return;
        return structuredClone(out)
      },

      /**
       * search records from share database
       * @param opts example: {id:'111',name:'test'}
       * @returns record/data
       * @example const userdb=db.connect('users');
       *                userdb.search({id:'userid',age:10})
       */
      search(queries:QueryData|QueryData[]=[]){
        const _queries:QueryData[]=[].concat(queries);
        const db:any[]=offline.db||[]
        const outs:any[]=db.filter(data=>checkQuery(_queries,data))
        return structuredClone(outs)
      },

      /**
       * handle change data event
       * @param callback handler
       * @example const userdb=db.connect('users');
       *                userdb.onUpdate((users)=>console.log('update user',users))
       */
      onUpdate(callback:(data:any[])=>any){
        const pos=offline.handlers.findIndex(x=>x.id==id);
        if(pos!=-1) offline.handlers.splice(pos,1);//[pos]={id,callback}
        offline.handlers.push({id,callback})
        if(isNeedUpdate){
          callback(structuredClone(offline.db));
          isNeedUpdate=false;
        }
        //debug
        if(debug) console.log('onUpdate',{offline,globalOffline:that._offline,callback:callback.toString()})
      },

      /**
       * delete record with id
       * @param id id of record
       * @returns id of record
       * @example const userdb=db.connect('users');
       *                userdb.delete('userid')
       */
      async delete(id:string){ return await that.delete(tbl,id)}
    }
  }

  /**
   * delete record with id from firestore
   * @param tbl table
   * @param id record id
   * @returns none
   * @example db.delete('userid');
   */
  async delete(tbl:string,id:string){
    return await deleteDoc(doc(this.db,tbl,id))
  }

  
  /**
   * create/update record from firestore
   * @param tbl table
   * @param data data want to create/update
   * @param debug true=show log
   * @returns promise
   * @example try{db.add('users',{userid:'123',name:'abc',age:21})}catch(err=>console.log(err))
   */
  add(tbl:string,data:any,callback:DuplicateHandler=(list,newData,oldData)=>list.length?newData:null):Promise<any>{
    const {id,...rawData}=data;
    // console.log("01: add record '%s' to table '%s'",id,tbl)
    // case #1: new record without id
    if(!id) return addDoc(collection(this.db,tbl),rawData).then(refDoc=>{
      return {...rawData,id:refDoc.id}
    })
    // case #2: data with id
    return getDoc(doc(this.db,tbl,id)).then(snap=>{
      // case #2.1 new data with ID
      if(!snap.exists()) return this.setDoc(tbl,{...rawData,id})
      // case #2.2 existing data with ID
      const oldDb={...snap.data(),id:snap.id}
      const updateList=getUpdate(data,oldDb);
      const newData=callback(updateList,data,oldDb);
      if(!newData) {
        // console.log("02: nochange");
        return data;
      }
      // console.log("TEST, newdata",newData)
      // console.log("03: update database");
      return this.setDoc(tbl,newData)
    })
  }

  /**
   * set database with id
   * @param tbl table
   * @param data record
   * @returns record
   */
  setDoc(tbl:string,data:any):Promise<any>{
    const {id,...rawData}=data;
    const _id=id||makeId();
    // console.log("checkpoints[4]:setDoc record '%s' to table '%s'",)
    return setDoc(doc(this.db,tbl,_id),rawData).then(db=>{
      // console.log("checkpoints[4]:setDoc successfully for record '%s' to table '%s'",_id,tbl,{id})
      return {...rawData,id:_id}
    })
    .catch(err=>{
      // console.log("checkpoints[5]: setDoc failured! id='%s' table='%s'",_id,tbl,{id})
      console.log(err);
      throw err;
    })
  }


  /**
   * get record with id from firestore
   * @param tbl table (collection)
   * @param id record id
   * @returns record
   */
  async get(tbl:string,id:string,debug=null):Promise<any>{   
    //check offline
    const offline=this._offline[tbl];
    if(offline){
      const db:any[]=offline.db||[];
      const out=db.find(d=>d.id==id);
      if(!out) throw new Error("not exist database ");
      if(debug) console.log('get "%s" from "%s" with offline',id,tbl)
      return {...out,id}
    }
    // online
    return this._get(tbl,id,debug)
  }

  private async _get(tbl:string,id:string,debug=false):Promise<any>{
    if(!id||!tbl) throw new Error("data format is wrong")
    return getDoc(doc(this.db,tbl,id)).then(snap=>{
      if(!snap.exists()) throw new Error('data not exist')
      if(debug) console.log('get "%s" from "%s" with online',id,tbl)
      return {...snap.data(),id:snap.id}
    })
  }

  async get2(path:string):Promise<any>{
    const paths=path.split("/");
    console.log("get2-input",{paths})
    return getDoc(doc(this.db,...paths))
    .then((snap)=>{
      console.log("get2-002")
      //return {...snap.data(),id:snap.id}
      return snap.data()
    })
  }

  /**
   * monitor dabase from firestore
   * @param tbl table from db
   * @param callback handler when database change
   * @returns none
   * @example const ctr=monitor('users',(update,remove)=>{console.log(update,remove)})
   *          //unsubcribe when dont use
   *          ctr();
   */
  monitor(tbl:string,callback:Function){

    const c=collection(this.db,tbl);
    return onSnapshot(c,snap=>{
      const modified=[];
      const removed=[];
      const added=[];
      snap.docChanges().forEach(change=>{
        if(change.type==='added'){
          const data=change.doc.data()
          added.push({...data,id:change.doc.id})
        }
        if(change.type==='modified'){
          const data=change.doc.data()
          modified.push({...data,id:change.doc.id})
        }else if(change.type==='removed'){
          removed.push(change.doc.id);
        }
      });
      if(modified.length+removed.length+added.length){
        console.log("update db for '%s'",tbl);
        callback(added,modified,removed)
      }
    })
  }

  /**
   * search database from condition
   * @param tbl table/collection of database
   * @param queries condition for searching
   * @returns result of searching
   */
  async search(tbl:string,queries:QueryData[]|QueryData){
    const _queries:QueryData[]=[].concat(queries);

    //offline
    const offline=this._offline[tbl];
    if(offline){//have monitor
      const db:any[]=offline.db||[];
      const outs=db.filter(data=>checkQuery(queries,data));
      return structuredClone(outs)
    }
    //online
    const q=query(collection(this.db,tbl),..._queries.map(qr=>where(qr.key,qr.type,qr.value)))
    return getDocs(q).then(docs=>{
      const outs=[];
      docs.forEach(doc=>outs.push({...doc.data(),id:doc.id}))
      return outs;
    })
  }

  async gets(tbl:string,IDs:string[],type:"in"|"not-in"|"reject"="in"):Promise<any[]>{
    const offline=this._offline[tbl];
    if(type=='reject') return []
    //offline
    if(offline){
      const db:any[]=offline.db||[];
      const outs=db.filter(data=>checkQuery({type,key:'id',value:IDs},data))
      console.log("gets offline")
      return structuredClone(outs)
    }
    //online
    return getDocs(collection(this.db,tbl)).then(docs=>{
      const outs=[];
      docs.forEach(doc=>{
        const data={...doc.data(),id:doc.id}
        if(checkQuery({type,key:'id',value:IDs},data))
          outs.push(data)
      })
      console.log("get online");
      return outs;
    })
  }

}


function del(arrs:any[],id:any){
  if(!id) return -3;
  if(!arrs || !Array.isArray(arrs)) return -2;
  const pos=arrs.findIndex(x=>x.id==id);
  if(pos==-1) return -1;
  arrs.splice(pos,1);
  return pos;
}

export interface QueryData{
  key:string;
  value:any;
  type:QueryDataType;

}

export declare type QueryDataType="<"|"<="|"=="|">"|">="|"!="|"in"|"not-in"|"array-contains"|"array-contains-any"


export interface DuplicateHandler{
  (updateList:UpdateInf[],newObj:object,oldObj:object):object|null
}


/**
 * check queries for each reacord of database
 * @param queries queries condition
 * @param data each record
 * @returns true=correct query
 */
function checkQuery(queries:QueryData|QueryData[],data:any):boolean{
  if(data==undefined||typeof data!=='object') return false; //not object => false
  const _queries:QueryData[]=[].concat(queries);
  return _queries.every(({key,type,value})=>{
    const _data=data[key];              // compareData
    if(_data==undefined) return false;  // not exist value ==> false
    switch(type){
      case '==':return _data===value;
      case '!=': return _data!==value;
      case '<': return _data<value;
      case '<=': return _data<=value;
      case '>': return _data>value;
      case '>=': return _data>=value;
      case 'in': return [].concat(value).includes(_data);
      case 'not-in': return ![].concat(value).includes(_data);
      case 'array-contains': return [].concat(_data).includes(value);
      case 'array-contains-any': return [].concat(value).some(val=>[].concat(_data).includes(val))
    }
  })
}

function structuredClone<T>(obj:T):T{
  return JSON.parse(JSON.stringify(obj))
}