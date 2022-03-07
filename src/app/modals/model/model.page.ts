import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createModelData, ModelData, ToolData } from 'src/app/models/tools.model';
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
  isNew:boolean=false;
  isEdit:boolean=false;
  images:string[]=[];//base64 for temporary images
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
    console.log("initial value:",{model:this.model,tools:this.tools,groups:this.groups});
  }

  //buttons

  //save, back
  done(role?:any){
    console.log("done, role:",role);
    role=(role+"").toUpperCase();
    if(!role) role="OK"
    if(role=='OK'){//handle OK
      if(this.images.length){//new image
        const urls:string[]=[]
        const promiseAll=this.images.map(image=>{
          return this.storage.uploadImagebase64(image,"models/")
          .then(x=>x.url)
        })
        Promise.all(promiseAll)
        .then((result)=>{
          this.model.images=this.model.images.concat(result);
          this.db.add('models',this.model,true);
        })
        .catch(err=>this.disp.msgbox("ERR<br>"+err.message))
      }
      else{
        this.db.add('models',this.model,true);
      }
    }
    return this.modal.dismiss(this.model,role);
  }

  //new
  btnNew(){
    this.isNew=true;
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
  async detail(tool){
    const data=tool?{tool,model:this.model}:{model:this.model}
    console.log("test-001",{...data})
    await this.disp.showModal(ToolPage,{...data});
  }

  //duplicate
  duplicate(){
    const {id,...data}=this.model;
    this.model=createModelData({...data});
    this.tools=[];
    this.isEdit=true;
    this.isNew=true;
  }

  //add new image
  async addImage(){
    const {data,role}=await this.disp.showModal(CameraPage);
    if(role.toUpperCase()!="OK") return;
    this.images.push(data);
  }

}
