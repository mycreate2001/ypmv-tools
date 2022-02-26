import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app'
import { getFirestore,doc,getDoc,getDocs,updateDoc,
         addDoc,collection,deleteDoc,setDoc,connectFirestoreEmulator
                                    } from 'firebase/firestore'
import { compareObject } from '../../shares/minitools';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private db:any;
  constructor() { 
    const app=initializeApp(environment.firebaseConfig);
    this.db=getFirestore(app);
    connectFirestoreEmulator(this.db,'http://localhost',8080);//emulator

  }

  /** create refdb */
  connect(tbl:string){
    const that=this;
    return{
      async add(data:any){return await that.add(tbl,data)},
      async get(id:string){return await that.get(tbl,id)},
      async search(opts={}){ return await that.search(tbl,opts)},
      async delete(id:string){ return await that.delete(tbl,id)}
    }
  }

  /** delete */
  async delete(tbl:string,id:string){
    return await deleteDoc(doc(this.db,tbl,id))
  }

  /** create or update doc async */
  async add2(tbl:string,data:any){

    console.log("[%s]: start",tbl);
    let {id,...rawData}=data;
    if(rawData==undefined) {
      console.log("[%s] case #0",tbl);
      return new Error("data is error");}
    //new record
    if(!id) {
      console.log("[%s] case #1",tbl);
      return await addDoc(collection(this.db,tbl),data);
    }
    const origin=await this.get(tbl,id);
    console.log("TEST-1, origin:",origin);
    if(!origin || !compareObject(data,origin)){
      console.log("[%s] case #2",tbl);
      return await setDoc(doc(this.db,tbl,id),rawData)
    }
    console.log("[%s] case #3",tbl);
    return id;
  }

  /** create or update doc */
  add(tbl:string,data:any):Promise<any>{
    console.log("add record to '%s'",tbl);
    return new Promise(async (resolve,reject)=>{
      let {id,...rawData}=data;
      if(!id){/** new data without id */
        try{
          const docRef=await addDoc(collection(this.db,tbl),data);
          id=docRef.id;
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
          return resolve(id);
        }
        catch(err){
          console.log("#ERR-02:",err);
          return reject(err);
        }
      }

      /** no need update */
      console.log("not update");
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
}
