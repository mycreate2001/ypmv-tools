import { Component, OnInit } from '@angular/core';
import { ToolDetailPage } from '../../modals/model/model.page';
import { DisplayService } from '../../services/display/display.service';
import { getList } from '../../utils/minitools';
import { createModelData, ModelData, ToolData } from '../../models/tools.model';
import { searchObj, separateObj } from 'src/app/utils/data.handle';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
interface ModelExtend {
  tools:ToolData[];
  model:ModelData;
}

interface viewData {
  group:string;
  models:ModelExtend[]
}

@Component({
  selector: 'app-tools',
  templateUrl: './tools.page.html',
  styleUrls: ['./tools.page.scss'],
})
export class ToolsPage implements OnInit {
  views:viewData[]=[];
  origin:viewData[]=[];
  groups:string[]=[];
  key:string="";
  models:ModelData[]=[];
  tools:ToolData[]=[];
  toolDb:ConnectData;
  modelDb:ConnectData;
  newGroup:string="";
  constructor(
    private disp:DisplayService,
    private db:FirestoreService
  ) {
     //connect db
    this.modelDb=this.db.connect("models");
    this.modelDb.onUpdate((models:ModelData[])=>{
      //test
      this.models=models;
      //update model
      this.makeView(models);
      //handle group
      this.groups=getList(models,"group");
      const check=includesText(this.groups,this.newGroup);
      if(check) this.newGroup="";
      else this.groups.push(this.newGroup);
      console.log("\nupdate models\n",{models:this.models,tools:this.tools,groups:this.groups,views:this.views})
    })
    
    this.toolDb=this.db.connect("tools");
    this.toolDb.onUpdate((tools:ToolData[])=>{
      //test
      this.tools=tools;
      this.makeView(this.models);
      console.log("\nupdate tools\n",{models:this.models,tools:this.tools,groups:this.groups,views:this.views})
    })
  }

  ngOnInit() {
    this.update();
  }

  ngOnDestroy(){
    this.modelDb.disconnect();
    this.toolDb.disconnect();
    console.log("leave tools");
  }

  /** update data */

  //////////// ------------ Handle function -------------------
  async showDetail(model?:ModelData){
    const isNew=model?false:true;
    const isEdit=model?false:true;
    model=model||createModelData();

    const tools=this.tools.filter(t=>t.model==model.id);
    const groups=[...this.groups,this.newGroup];
    const {role,data}=await this.disp.showModal(ToolDetailPage,{model,tools,groups,isNew,isEdit});
    if(role.toLowerCase()!='ok') return;
    console.log({data});
    // this.modelDb.add(data);
  }

  update(){
    const models=this.key.length>=2?searchObj(this.key,this.models):this.models;
    this.makeView(models);
  }

  makeView(models:ModelData[]){
    console.log("make view-step1:",{models})
    let groups= separateObj(models,"group",{dataName:'models'});  //group=[{group,models}]
    console.log("make view-step2:",{groups})
    const results:viewData[]=groups.map(g=>{
      const models:ModelExtend[]=g.models.map(m=>{
        const tools=this.tools.filter(t=>t.model==m.id);
        return {tools,model:m}
      })
      return {group:g.group,models}
    });
    console.log("make view-step3:",{results})
    this.views=results;
  }


  async addCatelogy(){
    await this.disp.msgbox(
      "add new category",
      {
        mode:'ios',
        inputs:[{type:'text',placeholder:'new catelogy'}],
        buttons:[
          {
            text:'OK',role:'OK',
            handler:(data)=>{
              const newgroup=data[0] as string;
              const check=includesText(this.groups,newgroup)
              if(check) return this.disp.msgbox(`category '${newgroup}' is already exist`);
              this.newGroup=newgroup;
            }
          }
        ]
      }
    )
  }

}

function includesText(arrs:string[],key:string):boolean{
  return arrs.some(text=>text.toUpperCase()==key.toUpperCase())
}
