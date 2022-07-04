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
import { makeId } from '../../utils/minitools';
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
  connect(tbl:string,debug:boolean=false):ConnectData{
    const that=this;
    let offline=null;
    let isNeedUpdate:boolean=true;         //first time run
    /** not yet register this db */
    if(!this._offline[tbl]){//not exist
      this._offline[tbl]={db:[],ctr:null,callbacks:[]}
      offline=this._offline[tbl];
      // isNew=true;
      offline.ctr=this.monitor(tbl,(added:any[],modified:any[],removed:string[])=>{
        if(debug) console.log("before update",{db:offline.db,added,modified,removed})
        removed.forEach(id=>del(offline.db,id));

        modified.forEach(m=>{
          const i=offline.db.findIndex(x=>x.id==m.id);
          if(i!=-1) offline.db[i]=m;
        })

        added.forEach(data=>offline.db.push(data));
        
        if(debug) console.log("current db",offline.db);
        if(!offline || !offline.callbacks || !offline.callbacks.length) {
          console.log("callbacks error");return;
        }
        offline.callbacks.forEach(x=>x.callback(offline.db))
      });
      isNeedUpdate=false;
    }
    offline=this._offline[tbl] as ShareDatabase;
    const id=makeId(15,offline.callbacks);
    
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
        if(!offline.callbacks.length){
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
        if(isNeedUpdate){
          callback(offline.db);
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
  add(tbl:string,data:any,debug:boolean=false):Promise<string>{
    const _data=JSON.parse(JSON.stringify(data))
    if(debug) console.log("\nfirestore.add '%s'\n---------------",tbl,data);
    return new Promise(async (resolve,reject)=>{
      let {id,...rawData}=_data;
      /** new data without id */
      if(!id){
        try{
          if(debug) console.log(`add new doc without...`);
          const docRef=await addDoc(collection(this.db,tbl),data);
          id=docRef.id;
          if(debug) console.log(`done!, id="${id}"\n`);
          return resolve(id);
        }
        catch(err){
          console.log("#ERR-01:",err);
          return reject(err);
        }
      }

      /** create or override data with id */
      else{
        if(debug) console.log("create/overwrite record ");
        try{
          await setDoc(doc(this.db,tbl,id),rawData);
          if(debug) console.log(`done! id="${id}"\n`);
          return resolve(id);
        }
        catch(err){
          console.log("err:",{err});
          return reject(err);
        }
      }
    })
  }


  /**
   * get record with id from firestore
   * @param tbl table (collection)
   * @param id record id
   * @returns record
   */
  get(tbl:string,id:string,debug=null):Promise<any>{   
    return new Promise(async (resolve,reject)=>{
      if(debug) console.log("GET('%s','%s') debug:'%s'",tbl,id,debug)
      if(!id) return reject(new Error("not exist id"));//nothing
      const docRef=doc(this.db,tbl,id);
      const docSnap=await getDoc(docRef);
      if(docSnap.exists()) return resolve({id,...docSnap.data()})
      return reject(new Error(`not exist doc '${id}' in '${tbl}'`));//nothing
    })
  }

  async get2(path:string):Promise<any>{
    // const docsnap=await getDoc(doc(this.db,path))
    // return {...docsnap.data(),id:docsnap.id}
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
  search(tbl:string,queries:QueryData[]|QueryData){
    // console.log("[search2] test-002",{tbl,queries})
    const ref=collection(this.db,tbl);
    const _queries:QueryData[]=[].concat(queries);
    const q=query(ref,..._queries.map(qr=>where(qr.key,qr.type,qr.value)))
    // console.log("[search2] test-003",{q})
    return getDocs(q).then(docs=>{
      const outs=[];
      docs.forEach(doc=>outs.push({id:doc.id,...doc.data()}));
      console.log("[search] debug",{tbl,queries,outs})
      return outs;
    })
  }

  gets(tbl:string,IDs:string[],type:"Include"|"Exclude"|"Reject"="Include"):Promise<any[]>{
    return new Promise((resolve,reject)=>{
      console.log("GETS\n",{tbl,IDs,type})
      if(type=='Reject') return resolve([])
      const ref=collection(this.db,tbl);
      getDocs(ref).then(docs=>{
        const outs=[];
        docs.forEach(doc=>{
          const id=doc.id;
          if(type=="Include" && IDs.includes(id)) outs.push({id,...doc.data()})
          else if(type=='Exclude' && !IDs.includes(id)) outs.push({id,...doc.data()})
        })
        return outs;
      })
      .then(result=>resolve(result))
      .catch(err=>reject(err))
     
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