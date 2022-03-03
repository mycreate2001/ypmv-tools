import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Mode } from 'jsqr/dist/decoder/decodeData';
import { ModelData, ToolData } from 'src/app/models/tools.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { ToolPage } from '../tool/tool.page';
interface ModelDataExtend{
  tools:any[];
  model:ModelData;
}
@Component({
  selector: 'app-tool-detail',
  templateUrl: './model.page.html',
  styleUrls: ['./model.page.scss'],
})
export class ToolDetailPage implements OnInit {
  modelEx:ModelDataExtend;
  model:ModelData;
  tools:ToolData[]=[];
  groups:string[]=[];
  isNew:boolean=false;
  isEdit:boolean=false;
  constructor(
    private modal:ModalController,
    private disp:DisplayService
  ) {
    // console.log("model:",this.model);
    // this.backup=JSON.parse(JSON.stringify(this.model));
  }

  ngOnInit() {
    if(!this.modelEx){
      this.model=createModel();
      this.isNew=true;
      this.isEdit=true;
      return;
    }

    this.model=this.modelEx.model||createModel();
    this.tools=this.modelEx.tools;
    console.log("model:",this.model);
  }

  //buttons

  //save, back
  done(isSuccess:boolean=true){
    if(!isSuccess) return this.modal.dismiss(null,"cancel");
    console.log("save");
    return this.modal.dismiss(null,"ok");
  }

  //new
  btnNew(){
    this.isNew=true;
    this.model=createModel(this.model.group);
    this.tools=[];
  }

  //delete
  btnDelete(){
    //@@@
    console.log("delete tool '%s'",this.model.id);
    return this.done(false);
  }

  // detail each tool
  async detail(tool){
    const data=tool?{tool,model:this.model}:{model:this.model}
    console.log("test-001",{...data})
    await this.disp.showModal(ToolPage,{...data});
  }

  //duplicate
  duplicate(){
    const {id,...data}=this.model;
    this.model=new ModelData({id:'',...data});
    this.tools=[];
    this.isEdit=true;
    this.isNew=true;
  }

}

function createModel(group:string=""):ModelData{
  const out= {
    id:'',
    name:'',
    group:'',
    maintenance:0,
    image:''
  }
  return {...out,group}
}
