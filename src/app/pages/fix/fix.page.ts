import { Component, OnInit } from '@angular/core';
import { BasicItem, createBasicItem } from 'src/app/interfaces/basic-item.interface';
import { CompanyData, _DB_COMPANY } from 'src/app/interfaces/company.model';
import { CoverData, _DB_COVERS } from 'src/app/interfaces/cover.interface';
import { ToolData, _DB_TOOLS } from 'src/app/interfaces/tools.model';
import { _DB_USERS } from 'src/app/interfaces/user.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service-2';

@Component({
  selector: 'app-fix',
  templateUrl: './fix.page.html',
  styleUrls: ['./fix.page.scss'],
})
export class FixPage implements OnInit {

  constructor(private db:FirestoreService) { }

  async ngOnInit() {
    console.log("start to fix database");
    console.log("#1: fix tools");
    // const covers:CoverData[]=await this.db.search(_DB_COVERS);
    // const companies:CompanyData[]=await this.db.search(_DB_COMPANY);
    const tools:ToolData[]=await this.db.search(_DB_TOOLS);
    tools.forEach(async ( tool)=>{
      //initial
      let isChange:boolean=false
      let log:string=`tool:${tool.id}\n------------\n`
      console.log("#1-inital tool:",{tool,toolStr:JSON.stringify(tool)})
      //upper
      if(tool.upper==undefined){//old data need to fix
        const id:string=tool.upperId||"";
        const upper:CoverData=await this.db.get(_DB_COVERS,id);
          log+=`upper:'${id}'`
          if(!upper){
            tool.upper=null;
            log+="->ERROR\n"
          }
          else{
            log+=`(${upper.name})-->done\n`
            tool.upper=createBasicItem({...upper,type:'cover'})
            delete tool.upperId
            isChange=true;
          }
      }
      else{
        tool.upper=createBasicItem(tool.upper);
        isChange=true;
      }

      //company
      if(!tool.company){
        const id:string=tool['companyId'];
        const company:CompanyData=await this.db.get(_DB_COMPANY,id);
        log+="company:"+id;
        if(!company){
          tool.company=null;
          log+="-->ERROR\n";
        }
        else{
          log+=":"+company.name+"-->done\n"
          tool.company=createBasicItem({...company,type:'company'});
          delete tool.companyId;
          isChange=true;
        }
      }

      //stay
      if(typeof tool.stay=='string'){
        const id=tool.stay;
        log+="stay:"+id
        const company:CompanyData=await this.db.get(_DB_COMPANY,id);
        if(!company) log+="(empty)\n"
        else{
          log+=":"+company.name+'-->done\n'
          tool.stay=createBasicItem({...company,type:'company'})
          isChange=true;
        }
      }

      //user
      if(!tool.user){
        const id:string=tool['userId'];
        const user:CompanyData=await this.db.get(_DB_USERS,id);
        log+="user:"+id;
        if(!user){
          tool.user=null;
          log+="-->ERROR\n";
        }
        else{
          log+=":"+user.name+"-->done\n"
          tool.company=createBasicItem({...user,type:'user'});
          delete tool['userId']
          isChange=true;
        }
      }
      log+="updated!"
      console.log(log)
      //update to database
      console.log("final tool ",{tool,toolStr:JSON.stringify(tool)})
      if(isChange) await this.db.add(_DB_TOOLS,tool)
    })
  }

}
