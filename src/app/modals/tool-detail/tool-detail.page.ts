import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModelData, ToolData } from 'src/app/models/tools.model';
interface ModelDataExtend{
  tools:any[];
  model:ModelData;
}
@Component({
  selector: 'app-tool-detail',
  templateUrl: './tool-detail.page.html',
  styleUrls: ['./tool-detail.page.scss'],
})
export class ToolDetailPage implements OnInit {
  modelEx:ModelDataExtend;
  model:ModelData;
  tools:ToolData[]=[];
  groups:string[]=[];
  isNew:boolean=false;
  isDetail:boolean=false;
  constructor(
    private modal:ModalController
  ) {
    // console.log("model:",this.model);
    // this.backup=JSON.parse(JSON.stringify(this.model));
  }

  ngOnInit() {
    if(!this.modelEx){
      this.model=createModel();
      this.isNew=true;
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
