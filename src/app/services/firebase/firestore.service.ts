import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app'
import { getFirestore,doc,getDoc,getDocs,updateDoc,
         addDoc,collection,deleteDoc,setDoc,connectFirestoreEmulator,
         onSnapshot
                                    } from 'firebase/firestore'
import { compareObject } from '../../utils/minitools';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private _offlineDatas:any={};
  private db:any;
  constructor() { 
    const app=initializeApp(environment.firebaseConfig);
    this.db=getFirestore(app);
    // connectFirestoreEmulator(this.db,'http://localhost',8080);//emulator

  }

  /** create refdb */
  connect(tbl:string){
    const that=this;
    const _data=[];
    let _callback:Function=null;
    const del=(id:string)=>{
      console.log("delete '%s'",id);
      const i=_data.findIndex(x=>x.id==id);
      if(i!=-1) _data.splice(i,1);
    }
    const _ctr=this.monitor(tbl,({updated,removed})=>{
      removed.forEach(id=>del(id));
      updated.forEach(data=>_data.push(data));
      const data=JSON.parse(JSON.stringify(_data));
      if(_callback) _callback(data);
    })
    return{
      disconnect(){
        _ctr();
        _callback=null
      },
      async add(data:any,debug){return await that.add(tbl,data,debug)},
      get(id:string){
        const out=_data.find(x=>x.id==id);
        if(!out) return;
        return JSON.parse(JSON.stringify(out))
      },
      search(opts={}){
        const keys=Object.keys(opts);
        const outs=_data.filter(data=>keys.every(key=>opts[key]==data[key]))||[];
        return JSON.parse(JSON.stringify(outs))
      },
      onUpdate(callback:(data:any[])=>any){
        _callback=callback;
      },
      async delete(id:string){ return await that.delete(tbl,id)}
    }
  }

  /** delete */
  async delete(tbl:string,id:string){
    return await deleteDoc(doc(this.db,tbl,id))
  }

  
  /** create or update doc */
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

  get(tbl:string,id:string):Promise<any>{
    return new Promise(async (resolve,reject)=>{
      if(!id) return reject(new Error("not exist id"));//nothing
      const docRef=doc(this.db,tbl,id);
      const docSnap=await getDoc(docRef);
      if(docSnap.exists()) return resolve({id,...docSnap.data()})
      return reject(new Error(`not exist doc '${id}'`));//nothing
    })
  }

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
        callback({updated,removed})
      }
    })
  }
}
