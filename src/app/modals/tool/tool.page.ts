import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createToolData, ModelData, ToolData } from 'src/app/models/tools.model';

@Component({
  selector: 'app-tool',
  templateUrl: './tool.page.html',
  styleUrls: ['./tool.page.scss'],
})
export class ToolPage implements OnInit {
  /** variable */
  tool:ToolData;
  model:ModelData;
  isDetail:boolean=false;
  visualStatus=['OK','Scratch','broken'];
  operationStatus=['OK','cannot operation'];
  functionStatus=['OK',"tolerance's out of specs"];
  isEdit:boolean=false;
  isNew:boolean=false;

  /** function */
  constructor(
    private modal:ModalController
  ) {
    
  }

  ngOnInit() {
    console.log("initial data:",{tool:this.tool,model:this.model});
    if(!this.tool){
      this.isEdit=true;
      this.isNew=true;
      this.tool=createToolData({model:this.model.id})//({model:this.model.id});
    }else{
      this.isEdit=false;
      this.isNew=false;
    }
    console.log("tool:",this.tool);
  }

  done(isOK:boolean=true){
    if(!isOK) return this.modal.dismiss(null,"cancel");
    this.modal.dismiss(null,'ok');
  }

  //

}
