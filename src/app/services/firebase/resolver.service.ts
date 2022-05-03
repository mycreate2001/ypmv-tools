import { Injectable } from '@angular/core';
import { FirestoreService,QueryData, QueryDataType } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ResolverService {

  constructor(private db:FirestoreService) { }
  handlerCallback(data:object|object[],buffer:BufferData){
    buffer.data=data;
    buffer.isAvailable=true;
    buffer.callbacks.forEach(cb=>cb&&cb(data))
  }

  /**
   * get data from db
   * @param config table,queries
   * @param _buffers 
   * @returns 
   */
  private getEnhanceData(config:Schema,_buffers:BufferData[]):Promise<object|object[]>{
    return new Promise((resolve,reject)=>{
      const id=config.table+"*"+JSON.stringify(config.queries);
      // 1. handler buffer
      let buffer:BufferData=_buffers.find(b=>b.id==id);
      // 1.1 new case
      if(!buffer){
        // 1.1.1 new buffer
        buffer={id,data:null,callbacks:[],isAvailable:false}
        _buffers.push(buffer)
        const idQuery:QueryData=[].concat(config.queries).find((q:QueryData)=>q.key=='id')
        // 1.1.2 get/gets with ID/IDs
        if(idQuery){
          // 1.1.2.1 get ID
          if(idQuery.type=='=='){
            this.db.get(config.table,idQuery.value,"TEST")
            .catch(err=>this.handlerCallback({},buffer))
            .then(data=>this.handlerCallback(data,buffer))
          }
          // 1.1.2.2 gets IDs
          else{
            const type=idQuery.type=='in'?"Include":idQuery.type=='not-in'?"Exclude":"Reject"
            this.db.gets(config.table,[].concat(idQuery.value),type)
            .then(data=>this.handlerCallback(data,buffer))
            .catch(err=>reject(err))
          }
        }
        // 1.1.2 search
        else{
          this.db.search(config.table,config.queries).then(datas=>this.handlerCallback(datas,buffer))
        }
      }
      // 1.2 common
      if(buffer.isAvailable) return resolve(buffer.data)
      buffer.callbacks.push((data)=>resolve(data))
    })
  }

  /**
   * update query for %key%
   * @param data 
   * @param queries 
   * @returns 
   */
  private updateQuery(data:object,queries:QueryData|QueryData[]):QueryData[]{
    const _queries:QueryData[]=JSON.parse(JSON.stringify([].concat(queries)))
    _queries.forEach(query=>{
      if(typeof query.value!=='string') return;
      Object.keys(data).forEach(key=>{
        query.value=query.value.replace(`%${key}%`,data[key])
      })
    })
    return _queries;
  }

  /**
   * handler data when available
   * @param data 
   * @param config 
   * @returns 
   */
  private handlerEachData(data:object,config:Schema,_buffers:BufferData[]){
    const _all=config.items.map(async item=>{
      if(typeof item=='string') return {item,value:data[item]}
      let queries=JSON.parse(JSON.stringify(item.queries))
      queries=this.updateQuery(data,queries);
      return {item:item.name,value:await this.query({...item,queries},_buffers)}
      })

    return Promise.all(_all)
    .then(results=>{
      const out:object={};
      results.forEach(result=>{
        out[result.item]=result.value
      })
      return out;
    })
  }

  /**
   * query data as config condition
   * @param config 
   * @param _buffers 
   * @returns Database
   * @example
    const config:Schema={
      table:'bookInfors',
      name:'test',
      queries:[],
      items:["id","companyId","userId","approvedBy","checkingManId",
        { 
          table:'users',
          name:'createBy',
          queries:{key:'id',type:'==',value:'%userId%'},
          items:['id','name','email','companyId']
        }
      ]
    };
    this.rs.query(config)
    .then(result=>console.log("\n\nTEST\n---------TESTT ---------\n",{result}))
    // home.page.ts
    // contructor(private rs:ReserverService)
   */
  query(config:Schema,_buffers:BufferData[]=[]):Promise<object|object[]>{
    return new Promise((resolve,reject)=>{
      this.getEnhanceData(config,_buffers)
      .then(datas=>{
        if(!datas||!Object.keys(datas).length) return resolve({})
        if(Array.isArray(datas)){
          const all=datas.map(data=>this.handlerEachData(data,config,_buffers))
          Promise.all(all)
          .then(data=>resolve(data))
          .catch(err=>reject(err))
        }
        else{
          this.handlerEachData(datas,config,_buffers)
          .then(data=>resolve(data))
          .catch(err=>reject(err))
        }

      })
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
  id:string;
  data:object[]|object;
  isAvailable:boolean;
  callbacks:Function[];
}