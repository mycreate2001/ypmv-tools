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
    this.fixTarget();
  }

  async fixTarget(){
    const tools:ToolData[]=await this.db.search(_DB_TOOLS);
    Promise.all(tools.map(async tool=>{
      let isUpdate:boolean=false;
      if(tool.targetMch===undefined) {
        tool.targetMch=[]; isUpdate=true;
      }
      if(isUpdate) {
        await this.db.add(_DB_TOOLS,tool);
        console.log(`tool '${tool.id}' updated`);
      }else {
        console.log(`tool '${tool.id}' no change`)
      }
    }))
    .then(_=>console.log("\n---- Update complete for all Tools ---"))
    .catch(err=>console.warn(`\n ---- ERROR ----\n|\t update tools is error\n`,err))

    // cover
    const covers:CoverData[]=await this.db.search(_DB_COVERS);
    Promise.all(covers.map(async cover=>{
      let isUpdate:boolean=false;
      //targetMch
      if(cover.targetMch===undefined){
        cover.targetMch=[];
        isUpdate=true;
      }

      //result
      if(isUpdate){
        await this.db.add(_DB_COVERS,cover)
        console.log(`cover '${cover.id}' was updated!`)
      }else{
        console.log(`cover '${cover.id}' was no changing!`)
      }
    }))
    .then(_=>console.log("all covers was updated!"))
    .catch(err=>console.warn(`\n ---- ERROR ----\n|\t update covers is error\n`,err))
  }

}
