import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BarcodeFormat } from '@zxing/library'
import { analysisCode } from 'src/app/models/codeformat';
import { DisplayService } from 'src/app/services/display/display.service';
const _BACKUP_LIST="formats,currentCamera".split(",")

@Component({
  selector: 'app-scan2',
  templateUrl: './scan2.page.html',
  styleUrls: ['./scan2.page.scss'],
})
export class Scan2Page implements OnInit {

  allowFormats=[
    //2D codes
    BarcodeFormat.DATA_MATRIX,BarcodeFormat.QR_CODE, 
     //1D codes
    BarcodeFormat.CODE_128,BarcodeFormat.CODE_93, BarcodeFormat.CODE_39,BarcodeFormat.EAN_13,  
  ]

  type:ScanType="analysis"
  title:string=""
  /** result */
  code:string="";
  analysis:Object={};
  formats=[];
  cameras=[];
  flash:boolean=false;
  currentCamera:MediaDeviceInfo=null;
  constructor(private modal:ModalController,private disp:DisplayService) { }
  ngOnInit() {
    this.restore();
    this.disp.showToast(["Camera",this.currentCamera.label])
  }

  backup(){
    _BACKUP_LIST.forEach(item=>{
      const data=JSON.stringify(this[item])
      localStorage.setItem(item,data)
    })
  }

  /** restore parameter */
  restore(){
    try{
      _BACKUP_LIST.forEach(item=>{
        const data=localStorage.getItem(item);
        if(data) this[item]=JSON.parse(data)
      })
    }
    catch(err) {console.log("restore error:",err.message)}
  }

  scanDone(e){
    this.code=e;
    if(this.type=='analysis'){
      this.analysis=analysisCode(e,this.formats)
    }
    this.done();
  }

  /** done */
  done(role:Scan2PageRole="ok"){
    const outs:Scan2pageOuts={
      code:this.code,
      analysis:this.analysis,
    }
    this.modal.dismiss(outs,role)
  }

  updateCamera(event){
    this.cameras=event;
    //this.restore();
    console.log("current camera",{current:this.currentCamera})
    this.disp.showToast(["Current camera",this.currentCamera.label])
    .then(()=>{
      this.restore();
      console.log("backup camera",{current:this.currentCamera})
      this.disp.showToast(["backup camera",this.currentCamera.label])
    })
  }

  changeCamera(){
    console.log("change camera-test001",{current:this.currentCamera})
    let pos=this.cameras.findIndex(c=>c['deviceId']==this.currentCamera['deviceId']);
    if(pos==-1) {
      this.currentCamera=this.cameras[0]
    }
    else{
      pos=(pos+1)%this.cameras.length
      this.currentCamera=this.cameras[pos];
    }
    this.backup();
    console.log("changeCamera/002",{pos,currentCamera:this.currentCamera})
  }

}

export type ScanType="code"|"analysis"
export type Scan2PageRole="ok"|"error"|"cancel"
export interface Scan2pageOuts{
  code:string;
  analysis:Object;
}
export interface Scan2PageOpts{
  type?:ScanType ;//default analysis
  title?:string;
}
