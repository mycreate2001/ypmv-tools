import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CompanyData, createCompanyData, CompanyType, _DB_COMPANY, _STORAGE_COMPANY } from 'src/app/interfaces/company.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { StorageService } from 'src/app/services/firebase/storage.service';
import { CameraPage, CameraPageOpts, CameraPageOuts, CameraPageRole } from '../camera/camera.page';


@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
})
export class CompanyPage implements OnInit {
  /**variable */
  company:CompanyData=createCompanyData();
  image:string;
  companyTypes:CompanyType[]=["Yamaha Branch","Agency","Customer"]
  /* function */
  constructor(
    private modal:ModalController,
    private storage:StorageService,
    private disp:DisplayService,
    private db:FirestoreService
  ) { }

  ngOnInit() {
  }
  private _uploadImage():Promise<CompanyData>{
    return new Promise((resolve,reject)=>{
      if(!this.image) return resolve(this.company);
      this.storage.uploadImagebase64(this.image,`${_STORAGE_COMPANY}/${this.company.id}.jpeg`)
      .then(url=>{
        this.company.image={url,caption:'',thumbnail:''};
        return resolve(this.company)
      })
      .catch(err=>reject(err))
    })
  }

  ///// buttons /////
  done(role:string="OK"){
    return this.modal.dismiss(this.company,role)
  }

  /** save button */
  save(){
    if(!this.company.id) return this.disp.msgbox("invalid id")
    this._uploadImage().then(company=>{
      return this.db.add(_DB_COMPANY,company)
    })
    .then(()=>{
      this.done()
    })
    .catch(err=>this.disp.msgbox("ERROR <br>"+err.message))
  }

  /** delete button */
  delete(){
    this.db.delete(_DB_COMPANY,this.company.id)
    .then(()=>this.done('delete'))
    .catch(err=>this.disp.msgbox("ERROR<br>"+err.message))
  }

  /** addImage button */
  addImage(){
    const props:CameraPageOpts={
      fix:false
    }
    this.disp.showModal(CameraPage,props)
    .then(result=>{
      const role=result.role as CameraPageRole
      if(role!='ok') return;
      const data=result.data as CameraPageOuts;
      this.image=data.image
      // this.image=result.data;
    })
    .catch(err=>this.disp.msgbox("err<br>"+err.message))
  }

}

