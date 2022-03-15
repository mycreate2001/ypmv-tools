import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { modelconfig } from 'src/app/models/config';
import { createModelData, createToolData, ModelData, ToolData } from 'src/app/models/tools.model';
import { UserData } from 'src/app/models/user.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { CameraPage } from '../camera/camera.page';
import { ImageViewPage } from '../image-view/image-view.page';
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
  images:string[]=[];       //iamges wil add more to db
  delImages:string[]=[];    //image will delete
  user:UserData=null;
  /** it's may get from database */
  visualStatus=["OK","scratch","Crack","other"];
  operationStatus=["OK","Not smomthly","Cannot operation","other"];
  functionStatus=["OK","Not correctly","other"];
  constructor(
    private modal:ModalController,
    private disp:DisplayService,
    private storage:StorageService,
    private db:FirestoreService,
    private auth:AuthService
  ) {
    // console.log("model:",this.model);
    // this.backup=JSON.parse(JSON.stringify(this.model));
  }

  ngOnInit() {
    console.log("initial value:",this);
    this.user=this.auth.currentUser;
  }

  /** upload image */
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


  /////////// buttons ///////////////

  /** end of modal */
  done(role:string="OK"){
    role=role.toUpperCase();
    this.modal.dismiss(this.model,role)
  }

  

  /** button for make duplicate model */
  duplicate(){
    const {id,...data}=this.model;
    this.model=createModelData({...data});
    this.tools=[];
    this.isEdit=true;
    // this.isNew=true;
  }

  /** button for handling add image */
  async addImage(){
    const {data,role}=await this.disp.showModal(CameraPage,{aspectRatio:modelconfig.aspectRatio});
    if(role.toUpperCase()!="OK") return;
    this.images.push(data);
  }

  /** button show image */
  showImage(){
    this.disp.showModal(ImageViewPage,{images:this.model.images})
    .then(result=>{
      if(result.role.toUpperCase()!='OK') return;
      const {images,addImages,delImages}=result.data;
      console.log({images,addImages,delImages})
      if(addImages.length+delImages.length) {
        this.isChange=true;
        this.isEdit=true;
        this.model.images=images;
        this.images=addImages;
        this.delImages=delImages;
      }
    })
  }


  /** button save */
  save(){
    //delete image
    if(this.delImages.length) {
      this.delImages.forEach(image=>this.storage.delete(image))
    }
    //upload image
    this.uploadImage()
    .then(model=> this.db.add(_DB_MODEL,model))
    .then(()=>this.done())
  }

  /** button delete model */
  delete(){
    this.db.delete(_DB_MODEL,this.model.id)
    this.done('delete')
  }

  /** button tool detail */
  detail(tool:ToolData){
    const isEdit:boolean=tool?false:true;
    if(!tool) tool=createToolData({model:this.model.id,userId:this.user.id})
    this.disp.showModal(ToolPage,{model:this.model,tool,isEdit})
  }

}
