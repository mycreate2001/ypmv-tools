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
         onSnapshot
                                    } from 'firebase/firestore'
import { compareObject, makeId } from '../../utils/minitools';
import { Unsubscribe } from 'firebase/auth';
interface HandleData{
  id:string;
  callback:{(data:any[]):any}
}
interface ShareDatabase{
  callbacks:HandleData[];
  ctr:Unsubscribe;
  db:any[];
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  /**
   * offlines={
   *    'users':{
   *      callbacks:[{id,cb}],
   *      ctr,
   *      db:[]
   *    }
   * }
   */
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
  connect(tbl:string){
    const that=this;
    if(!this._offline[tbl]){//not exist
      this._offline[tbl]={db:[],ctr:null,callbacks:[]}
    }
    //each offline
    const offline=this._offline[tbl] as ShareDatabase;
    const id=makeId(15,offline.callbacks);
    const del=(id:string)=>{
      const i=offline.db.findIndex(x=>x.id==id);
      if(i!=-1) offline.db.splice(i,1);
    }

    offline.ctr=this.monitor(tbl,(updated,removed)=>{
      removed.forEach(id=>del(id));
      updated.forEach(data=>offline.db.push(data));
      const data=JSON.parse(JSON.stringify(offline.db));
      if(!offline || !offline.callbacks || offline.callbacks.length) return;//error
      offline.callbacks.forEach(x=>x.callback(data))
    })
    //return function
    return{
      /**
       * disconnect with share database
       * @example const userdb=db.connect('users');
       *                userdb.disconnect()
       */
      disconnect(){
        //remove callback
        const pos=offline.callbacks.findIndex(x=>x.id==id);
        if(pos!=-1) offline.callbacks.splice(pos,1)
        //unsubscribe
        if(!offline.callbacks.length) offline.ctr();
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
        return JSON.parse(JSON.stringify(out))
      },
      /**
       * search records from share database
       * @param opts example: {id:'111',name:'test'}
       * @returns record/data
       * @example const userdb=db.connect('users');
       *                userdb.search({id:'userid',age:10})
       */
      search(opts={}){
        const keys=Object.keys(opts);
        const outs=offline.db.filter(data=>keys.every(key=>opts[key]==data[key]))||[];
        return JSON.parse(JSON.stringify(outs))
      },
      /**
       * handle change data event
       * @param callback handler
       * @example const userdb=db.connect('users');
       *                userdb.onUpdate((users)=>console.log('update user',users))
       */
      onUpdate(callback:(data:any[])=>any){
        const pos=offline.callbacks.findIndex(x=>x.id==id);
        if(pos!=-1) offline.callbacks.splice(pos,1);
        offline.callbacks.push({id,callback});
        //debug
        log('onUpdate',{offline,globalOffline:that._offline})
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
  add(tbl:string,data:any,debug:boolean=false):Promise<any>{
    console.log("add record to '%s'",tbl);
    return new Promise(async (resolve,reject)=>{
      let {id,...rawData}=data;
      if(!id){/** new data without id */
        try{
          const docRef=await addDoc(collection(this.db,tbl),data);
          id=docRef.id;
          if(debug) console.log("add new data '%s'",id);
          return resolve(id);
        }
        catch(err){
          console.log("#ERR-01:",err);
          return reject(err);
        }
      }

      /** need update */
      const origin=await this.get(tbl,id);
      if(!origin ||!compareObject(data,origin)){/** new data with id */
        try{
          await updateDoc(doc(this.db,tbl,id),rawData);
          if(debug) console.log("add new data '%s'",id);
          return resolve(id);
        }
        catch(err){
          console.log("#ERR-02:",err);
          return reject(err);
        }
      }

      /** no need update */
      if(debug) console.log("note update '%s'",id);
      return resolve(id);
    })
  }

  /**
   * search record from firestore
   * @param tbl table (collection)
   * @param opts search key
   * @returns array of record reach target
   */
  search(tbl:string,opts={}):Promise<any[]>{
    return new Promise(async (resolve,reject)=>{
      if(!opts) return reject (new Error("opts data is error")) //opts data is error
      try{
        const querySnap=await getDocs(collection(this.db,tbl));
        let outs=[];
        querySnap.forEach(doc=>{
          outs.push({id:doc.id,...doc.data()})
        });
        //filter
        const keys=Object.keys(opts);
        outs=outs.filter(out=>keys.every(key=>opts[key]==out[key]))
        return resolve(outs);
      }
      catch(err) {
        console.log("** ERR ** ",err);
        return reject(err);
      }
    })
  }

  /**
   * get record with id from firestore
   * @param tbl table (collection)
   * @param id record id
   * @returns record
   */
  get(tbl:string,id:string):Promise<any>{
    return new Promise(async (resolve,reject)=>{
      if(!id) return reject(new Error("not exist id"));//nothing
      const docRef=doc(this.db,tbl,id);
      const docSnap=await getDoc(docRef);
      if(docSnap.exists()) return resolve({id,...docSnap.data()})
      return reject(new Error(`not exist doc '${id}'`));//nothing
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
      const updated=[];
      const removed=[];
      snap.docChanges().forEach(change=>{
        console.log("have update data");
        if(change.type==='added'||change.type==='modified'){
          const data=change.doc.data()
          updated.push({...data,id:change.doc.id})
        }else if(change.type==='removed'){
          removed.push(change.doc.id);
        }
      });
      if(updated.length+removed.length){
        callback(updated,removed)
      }
    })
  }
}

function log(msg,...args){
  console.log('\n-----TEST-----\n'+msg,...args);
}
