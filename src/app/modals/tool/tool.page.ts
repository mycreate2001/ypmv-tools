import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModelData, ToolData } from 'src/app/models/tools.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
const _DB_TOOL='tools'
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
  editEnable:boolean=true;
  visualStatus=['OK','Scratch','broken'];
  operationStatus=['OK','cannot operation'];
  functionStatus=['OK',"tolerance's out of specs"];
  mItems=[
    {n:"Part No",v:"id"},
    {n:"Part Name",v:"name"},
    {n:"Category",v:"group"},
    {n:"Maintenance Period [days]",v:"maintenance"}
  ]
  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService
  ) {

  }

  ngOnInit() {
    if(this.isNew) this.isEdit=true;
    if(this.tool.stay)
    console.log("initial data:",this);
  }

  done(role:string="OK"){
    return this.modal.dismiss(this.tool,role);
  }

  save(){
    this.db.add(_DB_TOOL,this.tool)
    .then(()=>this.done())
  }

  delete(){
    this.db.delete(_DB_TOOL,this.tool.id)
    this.done('delete')
  }

}
