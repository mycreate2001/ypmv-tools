import { Component, OnInit } from '@angular/core';
import {  _DB_COMPANY } from 'src/app/interfaces/company.model';
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
    // this.fixTarget();
    // this.fixTarget2();
  }

  /** change .targetMch --> .targetMchs */
  async fixTarget2(){
    const tools:ToolData[]=await this.db.search(_DB_TOOLS);
    Promise.all(tools.map(async tool=>{
      tool.targetMchs=[];
      delete tool.targetMch;
      this.db.add(_DB_TOOLS,tool);
    }))
    .then(_=>console.log("\n---- Update complete for all Tools ---"))
    .catch(err=>console.warn(`\n ---- ERROR ----\n|\t update tools is error\n`,err))

    // cover
    const covers:CoverData[]=await this.db.search(_DB_COVERS);
    Promise.all(covers.map(async tool=>{
      tool.targetMchs=[];
      // delete tool.targetMch;
      this.db.add(_DB_COVERS,tool);
    }))
    .then(_=>console.log("\n---- Update complete for all covers ---"))
    .catch(err=>console.warn(`\n ---- ERROR ----\n|\t update covers is error\n`,err))
  }

}
