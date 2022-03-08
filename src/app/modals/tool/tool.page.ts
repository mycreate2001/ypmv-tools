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
  isNew:boolean=false;
  isEdit:boolean=false;
  isDetail:boolean=false;
  visualStatus=['OK','Scratch','broken'];
  operationStatus=['OK','cannot operation'];
  functionStatus=['OK',"tolerance's out of specs"];
  /** function */
  constructor(
    private modal:ModalController
  ) {
    
  }

  ngOnInit() {
    if(this.isNew) this.isEdit=true;
    console.log("initial data:",this);
  }

  done(role?:string){
    if(!role) role='OK';
    role=role.toUpperCase();
    return this.modal.dismiss(this.tool,role);
  }

  //

}
