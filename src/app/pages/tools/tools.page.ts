import { Component, OnInit } from '@angular/core';
import { ToolDetailPage } from '../../modals/model/model.page';
import { DisplayService } from '../../services/display/display.service';
import { getList } from '../../utils/minitools';
import { createModelData, ModelData, ToolData } from '../../models/tools.model';
import { searchObj, separateObj } from 'src/app/utils/data.handle';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { MenuData } from 'src/app/models/util.model';
// import { MenuData } from 'src/app/modals/menu/menu.page';
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

    /** test */
    const model=createModelData();
    const list=Object.keys(model);
    // const md=convert(as);
    console.log("\n\ntest\n",{model,list,test1:model['hasOwnProperty'],test2:list['hasOwnProperty'],test3:model['constructor']});
    /** Models */
    this.modelDb=this.db.connect("models");
    this.modelDb.onUpdate((models:ModelData[])=>{
      //test
      this.models=models;
      this.makeView(models);
      //handle group
      this.groups=getList(models,"group",true);
      const check=includesText(this.groups,this.newGroup);
      if(check) this.newGroup="";
      else this.groups.push(this.newGroup);
      console.log("\nupdate models\n",{models:this.models,tools:this.tools,groups:this.groups,views:this.views})
    })
    
    /** tools */
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
    const groups=this.newGroup?[...this.groups,this.newGroup]:this.groups;
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
          },
          {text:'Cancel',role:'cancel'}
        ]
      }
    )
  }
  //test
  test_showmenu(event){
    console.log("menu running");
    const menus:MenuData[]=[
      {name:'New tool Infor',handler:()=>this.showDetail(),role:'1'},
      {name:'new Category',handler:()=>this.addCatelogy(),role:'2'},
    ]
    this.disp.showMenu(event,{menus}).then(result=>{
      console.log("result of menu",result);
    })
  }

}

function includesText(arrs:string[],key:string):boolean{
  return arrs.some(text=>text.toUpperCase()==key.toUpperCase())
}
