import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import jsQR, { QRCode } from 'jsqr'
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { analysisCode, CodeFormatData, _DB_FORMATS } from 'src/app/models/codeformat';
import { createOpts } from 'src/app/utils/minitools';
import { BarcodeFormat } from '@zxing/library'
export declare type QRResultType = 'pure data' | 'data only' | 'analysis';
const _BACKUP_LIST=['flash','currentCamera'];//Keep local

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.page.html',
  styleUrls: ['./qrcode.page.scss'],
})
export class QrcodePage implements OnInit {
  /** viewchild */
  @ViewChild('video',{static:false}) videoRef:ElementRef;
  @ViewChild('canvas',{static:false}) canvasRef:ElementRef;
  
  /** input */
  title:string="";
  type:QRcodePageType='analysis'
  allowFormats=[
    //2D codes
    BarcodeFormat.DATA_MATRIX, BarcodeFormat.QR_CODE, 
     //1D codes
    BarcodeFormat.CODE_128,BarcodeFormat.CODE_93, BarcodeFormat.CODE_39,BarcodeFormat.EAN_13,  
  ]
  /** internal */
  cameras:MediaDeviceInfo[]=[];
  flash:boolean=false;
  currentCamera:MediaDeviceInfo=null;
  
  /** database */
  formats:CodeFormatData[]=[];

  /** output */
  code:string='';
  analysis:object={}
  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private disp:DisplayService
  ) {}

  ngOnInit() {
    this._restore();
    //get formating from db
    if(this.type=='analysis'){
      this.db.search(_DB_FORMATS,[]).then((formats:CodeFormatData[])=>{
        this.formats=formats;
      })
    }
  }

  stopScan(){}

  changeCamera(){
    if(!this.currentCamera) {
      this.currentCamera=this.cameras[0];
      return;
    }
    let pos=this.cameras.findIndex(c=>c.deviceId==this.currentCamera.deviceId);
    if(pos==-1){
      this.currentCamera=this.cameras[0];
    }
    else{
      pos=(pos+1)%this.cameras.length;
      this.currentCamera=this.cameras[pos]
    }
    this._backup();
  }

  private _backup(){
    _BACKUP_LIST.forEach(item=>{
      const data=JSON.stringify(this[item])
      localStorage.setItem(item,data)
    })
  }

  private _restore(){
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
      this.analysis=analysisCode(e,this.formats);
      this.done();
    }
  }

  updateCamera(event){
    this.cameras=event;

  }

  done(role:QRcodePageRole='ok'){
    const out:QRcodePageOuts={
      raw:null,
      code:this.code,
      analysis:this.analysis
    }
    if(role=='ok') console.log("result:",out);
    this.modal.dismiss(out,role)
  }

  // /** scan QRcode */
  // scan(){
  //   navigator.mediaDevices.getUserMedia(this.medias)
  //   .then((stream:MediaStream)=>{
  //     this.videoRef.nativeElement.srcObject=stream;
  //     this.checkImage();
  //   })
  //   .catch(err=>{
  //     console.log("***ERR ***\nstart video error");
  //     this.done('error');
  //   })
  // }

  // /** change camera */
  // changeCamera(){
  //   if(this.cameraPos==undefined) {//first times
  //     const deviceId=localStorage.getItem(_LOCAL_DEVICEID);
  //     if(!deviceId){//not save before/first time run application
  //       this.medias.video={facingMode:{ideal:'environment'}};//real camera
  //       this.cameraPos=-1;
  //     }
  //     else{
  //       this.medias.video={deviceId}
  //       this.cameraPos=-1;
  //     }
  //     this.scan();
  //     return;
  //   }
  //   //save before
  //   this._getDevices('videoinput')
  //   .then(cameras=>{
  //     if(++this.cameraPos>=cameras.length) this.cameraPos=0;
  //     const deviceId=cameras[this.cameraPos].deviceId;
  //     localStorage.setItem(_LOCAL_DEVICEID,deviceId)
  //     this.stopScan(false);
  //     this.medias.video={deviceId}
  //     this.scan()
  //   })
  
  // }


  // /** stop scan QRcode */
  // stopScan(cancel=true){
  //   if(this.timout) clearTimeout(this.timout);
  //   this.medias.video=false;
  //   const obj=this.videoRef.nativeElement.srcObject;
  //   if(obj){
  //     const a=obj.getVideoTracks()[0]
  //     a.enable=false;
  //     a.stop();
  //   }
  //   if(cancel) this.modal.dismiss(null,"cancel");
  // }

  // /** check QR code */
  // checkImage(){
  //   const video=this.videoRef.nativeElement;
  //   const width=video.clientWidth;
  //   const height=video.clientHeight;
  //   const canvas=this.canvasRef.nativeElement;
  //   canvas.width=width;
  //   canvas.height=height;
  //   //context
  //   const context=canvas.getContext('2d') as CanvasRenderingContext2D;
  //   context.drawImage(video,0,0,width,height);
  //   const imageData=context.getImageData(0,0,width,height);
  //   const code=jsQR(imageData.data,width,height,{inversionAttempts:'attemptBoth'});
  //   if(code){
  //     console.log("code:",code);
  //     this.stopScan(false);
  //     //have result
  //     switch(this.type){
  //       /** pure scan code */
  //       case 'raw':{
  //         this.done('ok',{raw:code})
  //       }
  //       break;
  //       /** data only */
  //       case 'code':{
  //         this.done('ok',{code:code.data})
  //       }
  //       break;
  //       /** analysis */
  //       case 'analysis':{
  //         const result=analysisCode(code.data,this.formats);
  //         if(!result) {
  //           this.disp.msgbox(`analysis code NG<br>code:${code.data}`);
  //           return this.done('error')
  //         }
  //         this.done('ok',{analysis:result})
  //       }
  //       break;
  //       default:
  //         console.log("\n### ERROR: out of case")
  //     }
  //     return;
   
  //   }
    
  //   this.timout=setTimeout(()=>this.checkImage(),100);
  // }

  // /** exit scan code */
  // done(role:QRcodePageRole='ok',data?:QRcodePageOutsOpts){
  //   const out=createQRcodePageOut(data);
  //   this.modal.dismiss(out,role)
  // }

  // //background /////////////////
  // private _getDevices(kind:MediaDeviceKind|"All"):Promise<MediaDeviceInfo[]>{
  //   return new Promise((resolve,reject)=>{
  //     navigator.mediaDevices.enumerateDevices()
  //     .then(devices=>{
  //       devices=kind=="All"?devices:devices.filter(d=>d.kind==kind);
  //       return resolve(devices);
  //     })
  //     .catch(err=>reject(err))
  //   })
  // }


}



//** interface */
export type QRcodePageRole="cancel"|"error"|"ok"
export type QRcodePageType="raw"|"code"|"analysis"
/**
 * @param raw:QRCode;   //raw data
 * @param code:string;  // code
 * @param analysis:Object;    //analysis
 */
export interface QRcodePageOuts{
  /** for type = raw */
  raw:QRCode;  
  /** for type=code */
  code:string; 
  /** result of type=analysis */
  analysis:Object; 
}

interface QRcodePageOutsOpts{
  /** for type = raw */
  raw?:QRCode;  
  /** for type=code */
  code?:string; 
  /** result of type=analysis */
  analysis?:Object;
}

function createQRcodePageOut(opts?:QRcodePageOutsOpts){
  const df:QRcodePageOuts={
    raw:null,code:null,analysis:null
  }

  return createOpts(df,opts)
}

/**
 * @param type? typeof scan result
 * @param title?:title display on scan page;
 */
export interface QRcodePageOpts{
  /** typeof scan result, default ='code' */
  type?:QRcodePageType;
  /** title display on scan page, default (blank) */
  title?:string;
  allowFormats?:BarcodeFormat[]; 
}