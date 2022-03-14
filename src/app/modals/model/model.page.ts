import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createModelData, createToolData, ModelData, ToolData } from 'src/app/models/tools.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { CameraPage } from '../camera/camera.page';
import { ToolPage } from '../tool/tool.page';
const _DB_MODEL="models"
@Component({
  selector: 'app-tool-detail',
  templateUrl: './model.page.html',
  styleUrls: ['./model.page.scss'],
})
export class ToolDetailPage implements OnInit {
  model:ModelData;
  tools:ToolData[]=[];
  groups:string[]=[];
  pos:number=0; //tool position
  isChange:boolean=false;
  isEdit:boolean=false;
  images:string[]=[];//base64 for temporary images
  /** it's may get from database */
  visualStatus=["OK","scratch","Crack","other"];
  operationStatus=["OK","Not smomthly","Cannot operation","other"];
  functionStatus=["OK","Not correctly","other"];
  constructor(
    private modal:ModalController,
    private disp:DisplayService,
    private storage:StorageService,
    private db:FirestoreService
  ) {
    // console.log("model:",this.model);
    // this.backup=JSON.parse(JSON.stringify(this.model));
  }

  ngOnInit() {
    console.log("initial value:",this);
  }

  //buttons

  /** end of modal */
  done(role:string="OK"){
    role=role.toUpperCase();
    this.modal.dismiss(this.model,role)
  }

  //new
  btnNew(){
    // this.isNew=true;
    this.model=createModelData({group:this.model.group});
    this.tools=[];
  }

  //delete
  btnDelete(){
    //@@@
    console.log("delete tool '%s'",this.model.id);
    this.db.delete(_DB_MODEL,this.model.id);
    return this.done('delete');
  }

  // detail each tool
  async detail(iTool?:ToolData){
    const isNew=iTool?false:true;
    const tool=iTool||createToolData({model:this.model.id})
    const model=this.model;
    const result=await this.disp.showModal(ToolPage,{isNew,tool,model});
    const role=result.role.toUpperCase();
    switch(role){
      case 'OK':{
        console.log("test, data:",result.data);
        this.db.add('tools',result.data);
      }
      break;

      case 'DELETE':{
        this.db.delete('tools',result.data.id);
      }
    }
  }

  //duplicate
  duplicate(){
    const {id,...data}=this.model;
    this.model=createModelData({...data});
    this.tools=[];
    this.isEdit=true;
    // this.isNew=true;
  }

  //add new image
  async addImage(){
    const {data,role}=await this.disp.showModal(CameraPage);
    if(role.toUpperCase()!="OK") return;
    this.images.push(data);
  }

  //upload image
  uploadImage():Promise<ModelData>{
    return new Promise((resolve,reject)=>{
      if(!this.images.length) return resolve(this.model);
      const all=this.images.map(image=>this.storage.uploadImagebase64(image));
      Promise.all(all)
      .then(uImages=>{
        const urls=uImages.map(x=>x.url);
        this.model.images=this.model.images.concat(urls);
        return resolve(this.model)
      })
      .catch(err=>reject(err))
    })
  }

  /** button save */
  save(){
    this.uploadImage()
    .then(model=> this.db.add(_DB_MODEL,model))
    .then(()=>this.done())
  }

}
