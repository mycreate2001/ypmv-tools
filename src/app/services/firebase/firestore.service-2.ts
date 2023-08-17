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
         where,
         Firestore } from 'firebase/firestore'
import { makeId } from '../../utils/minitools';
import { getUpdate, UpdateInf } from 'src/app/utils/data.handle';
import { debug } from 'console';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService {
  private db:Firestore=null;
  constructor() { 
    const app=initializeApp(environment.firebaseConfig);
    this.db=getFirestore(app);
    // connectFirestoreEmulator(this.db,'http://localhost',8080);//emulator

  }

  connect<T extends DatabaseBasic>(tbl:string){
    const that=this

    return{
      async add(data:T,callback):Promise<T>{
        return that.add(tbl,data,callback)
      },
      async get(id:string,debug:boolean=false):Promise<T>{
        return that.get(tbl,id,debug)
      },
      async gets(ids:string[],type?:DatabaseGetType):Promise<T[]>{
        return that.gets(tbl,ids,type)
      },
      async search(...queries:QueryData[]):Promise<T[]>{
        return that.search(tbl,...queries)
      }
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
  add<T extends DatabaseBasic>(tbl:string,data:T,callback:DuplicateHandler=(list,newData:T,oldData:T)=>list.length?newData:null):Promise<T>{
    const {id,...rawData}=data;
    // console.log("01: add record '%s' to table '%s'",id,tbl)
    // case #1: new record without id
    if(!id) return addDoc(collection(this.db,tbl),rawData).then(refDoc=>{
      return {...data,id:refDoc.id}
    })
    // case #2: data with id
    return getDoc(doc(this.db,tbl,id)).then(snap=>{
      // case #2.1 new data with ID
      if(!snap.exists()) return this.setDoc(tbl,{...data,id})
      // case #2.2 existing data with ID
      const oldDb={...snap.data(),id:snap.id}
      const updateList=getUpdate(data,oldDb);
      const newData=callback(updateList,data,oldDb) as T;
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
   * The function `setDoc` takes a table name and data as input, creates a new document in the
   * specified table with the given data, and returns a Promise that resolves to the updated data with
   * an added `id` property.
   * @param {string} tbl - The `tbl` parameter is a string that represents the name of the table in the
   * database where the document will be stored.
   * @param {T} data - The `data` parameter is an object of type `T`, which extends `DatabaseBasic`. It
   * represents the data that needs to be stored in the database.
   * @returns The function `setDoc` returns a Promise that resolves to an object of type `T`.
   */
  setDoc<T extends DatabaseBasic>(tbl:string,data:T):Promise<T>{
    const {id,...rawData}=data;
    const _id=id||makeId();
    // console.log("checkpoints[4]:setDoc record '%s' to table '%s'",)
    return setDoc(doc(this.db,tbl,_id),rawData).then(db=>{
      // console.log("checkpoints[4]:setDoc successfully for record '%s' to table '%s'",_id,tbl,{id})
      return {...data,id:_id}
    })
    .catch(err=>{
      // console.log("checkpoints[5]: setDoc failured! id='%s' table='%s'",_id,tbl,{id})
      console.log(err);
      throw err;
    })
  }



  /**
   * The function `get` retrieves a document from a specified table using its ID and returns it as a
   * Promise.
   * @param {string} tbl - The `tbl` parameter represents the name of the table or collection in the
   * database where the document is located.
   * @param {string} id - The `id` parameter is the unique identifier of the document you want to
   * retrieve from the specified table.
   * @param {boolean} [debug=false] - The `debug` parameter is a boolean flag that determines whether
   * or not to log debug information to the console. If `debug` is set to `true`, it will log the
   * message "get [id] from [tbl] with online" to the console.
   * @returns a Promise that resolves to an object of type T.
   */
  async get<T>(tbl:string,id:string,debug:boolean=false):Promise<T|undefined>{
    if(!id||!tbl) return;
    return getDoc(doc(this.db,tbl,id)).then((snap)=>{
      if(!snap.exists()) return;
      if(debug) console.log('get "%s" from "%s" with online',id,tbl)
      const data=snap.data() as T
      return {...data,id:snap.id}
    })
  }

  
  /**
   * The `monitor` function listens for changes in a Firestore collection and calls a callback function
   * with the added, modified, and removed documents.
   * @param {string} tbl - The `tbl` parameter is a string that represents the name of the collection
   * in the database that you want to monitor for changes.
   * @param {Function} callback - The callback parameter is a function that will be called whenever
   * there are changes in the specified collection (tbl). It will be passed three arguments: added,
   * modified, and removed.
   * @returns the result of calling the `onSnapshot` function on the Firestore collection `c`.
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
  * The function `search` is an asynchronous function that takes a table name and a list of queries or
  * a single query, and returns the matching documents from the offline or online database.
  * @param {string} tbl - The `tbl` parameter is a string that represents the name of the table or
  * collection in the database that you want to search in.
  * @param {QueryData[]|QueryData} queries - The `queries` parameter can be either an array of
  * `QueryData` objects or a single `QueryData` object. The `QueryData` object has the following
  * properties:
  * @returns The function `search` returns a promise that resolves to an array of objects. Each object
  * represents a document in the specified collection and includes the document data as well as the
  * document ID.
  */
  async search<T extends DatabaseBasic>(tbl:string,...queries:QueryData[]):Promise<T[]>{
    const q=query(collection(this.db,tbl),...queries.map(qr=>where(qr.key,qr.type,qr.value)))
    return getDocs(q).then(docs=>{
      const outs:T[]=[];
      docs.forEach(doc=>outs.push({...doc.data() as T,id:doc.id}))
      return outs;
    })
  }


  /**
   * The function "gets" retrieves multiple documents from a specified table in a database based on a
   * given set of IDs.
   * @param {string} tbl - The `tbl` parameter is a string that represents the name of the table or
   * collection in the database from which you want to retrieve data.
   * @param {string[]} IDs - The `IDs` parameter is an array of strings that represents the IDs of the
   * documents you want to retrieve from the database.
   * @param {DatabaseGetType} [type=in] - The `type` parameter is used to specify the type of database
   * retrieval operation. It can have three possible values:
   * @returns a Promise that resolves to an array of objects of type T.
   */
  async gets<T>(tbl:string,IDs:string[],type:DatabaseGetType="in"):Promise<T[]>{
    if(type=='reject') return []
    return getDocs(collection(this.db,tbl)).then(docs=>{
      const outs=[];
      docs.forEach(doc=>{
        const data={...doc.data(),id:doc.id}
        if(checkQuery({type,key:'id',value:IDs},data))
          outs.push(data)
      })
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

////////////////////// interface /////////////////////
export interface DatabaseBasic{
  id:string;
}
export type DatabaseGetType="in"|"not-in"|"reject"

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