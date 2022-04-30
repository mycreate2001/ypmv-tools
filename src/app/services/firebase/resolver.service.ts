import { Injectable } from '@angular/core';
import { FirestoreService,QueryData, QueryDataType } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ResolverService {

  constructor(private db:FirestoreService) { }
  gets(config:Schema,_buffers:BufferData[]=[]){
    return new Promise( async (resolve,reject)=>{
      if(!config) return reject(new Error("config is empty"))
      const table=config.table;
      const queries:QueryData[]=[].concat(config.queries||[])
      let arrs:object[]=[]
      const _buffer=_buffers.find(b=>b.table==table&&b.queries==JSON.stringify(queries))
      //get data inside buffer
      if(_buffer) {arrs=_buffer.arrs;}
      //get data from database
      else {
        //check by gets
        const queryWithID=queries.find(q=>q.key=='id');
        if(queryWithID){
          const iLst:QueryDataType[]=["==",'in'];
          const eLst:QueryDataType[]=["!=","not-in"]
          let condition:"Include"|"Exclude"|"Reject"=
            iLst.includes(queryWithID.type)?"Include":
            eLst.includes(queryWithID.type)?"Exclude":"Reject";
          
          arrs=await this.db.gets(config.table,[].concat(queryWithID.value), condition )
        }
        //check by search queries
        else{
          arrs=await this.db.search(config.table,config.queries)
        }
        _buffers.push({table,queries:JSON.stringify(queries),arrs})//save to buffers
        
      }

      this.filters(arrs,config.items,_buffers)
      .then(results=>resolve(results))
      .catch(err=>reject(err))
    })
  }

  _filter(arr: object, items: (string | Schema)[], _buffers): Promise<object> {
    return new Promise((resolve, reject) => {
      const all = items.map(async item => {
        //basic case
        if (typeof item == 'string') return { key: item, value: arr[item] }
        let queries: QueryData[] = JSON.parse(JSON.stringify([].concat(item.queries || [])))
        //handler queries
        queries.forEach(query => {
          if (!(query.value + "").includes("%")) return
          Object.keys(arr).forEach(key => {
            query.value = (query.value + "").replace("%" + key + "%", arr[key])
          })
        });
        // return for object type
        return {
          key: item.name,
          value: await this.gets({ ...item, queries }, _buffers)
        }
      })
      Promise.all(all).then(results => {
        const out = {}
        results.forEach(result => {
          out[result.key] = result.value
        })
        return resolve(out)
      })
      .catch(err=>reject(err))
    })
  }

  /** */
  filters(arrs: object[], items: (string | Schema)[], _buffers): Promise<object[]> {
   return new Promise((resolve,reject)=>{
    const all=arrs.map(arr=>this._filter(arr,items,_buffers))
    Promise.all(all).then(results=>resolve(results))
    .catch(err=>reject(err))
   })
  }

}


export interface Schema{
  name:string;
  table:string;
  queries:QueryData|QueryData[];
  items:(string|Schema)[];
}
interface BufferData{
  table:string;
  queries:string;
  arrs:object[];
}