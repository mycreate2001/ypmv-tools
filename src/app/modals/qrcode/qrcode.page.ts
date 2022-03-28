import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import jsQR, { QRCode } from 'jsqr'
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { analysisCode, CodeFormatData, _DB_FORMATS } from 'src/app/models/codeformat';
import { createOpts } from 'src/app/utils/minitools';

export declare type QRResultType = 'pure data' | 'data only' | 'analysis';
const _LOCAL_DEVICEID="deviceId"
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
  /** internal */
  private medias:MediaStreamConstraints={
    video:{facingMode:'environment',deviceId:''},
    audio:false
  };
  private timout:any=null;
  cameraPos:number; //camera position , it use for changing camera
  
  /** database */
  formats:CodeFormatData[]=[];

  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private disp:DisplayService
  ) {}

  ngOnInit() {
    // load format
    if(this.type=='analysis'){
      this.db.search(_DB_FORMATS,[]).then((formats:CodeFormatData[])=>{
        this.formats=formats;
      })
    }
    //get cameras
    this.changeCamera()
  }


  /** scan QRcode */
  scan(){
    navigator.mediaDevices.getUserMedia(this.medias)
    .then((stream:MediaStream)=>{
      this.videoRef.nativeElement.srcObject=stream;
      this.checkImage();
    })
    .catch(err=>{
      console.log("***ERR ***\nstart video error");
      this.done('error');
    })
  }

  /** change camera */
  changeCamera(){
    if(this.cameraPos==undefined) {//first times
      const deviceId=localStorage.getItem(_LOCAL_DEVICEID);
      if(!deviceId){//not save before/first time run application
        this.medias.video={facingMode:{ideal:'environment'}};//real camera
        this.cameraPos=-1;
      }
      else{
        this.medias.video={deviceId}
        this.cameraPos=-1;
      }
      this.scan();
      return;
    }
    //save before
    this._getDevices('videoinput')
    .then(cameras=>{
      if(++this.cameraPos>=cameras.length) this.cameraPos=0;
      const deviceId=cameras[this.cameraPos].deviceId;
      localStorage.setItem(_LOCAL_DEVICEID,deviceId)
      this.stopScan(false);
      this.medias.video={deviceId}
      this.scan()
    })
  
  }


  /** stop scan QRcode */
  stopScan(cancel=true){
    if(this.timout) clearTimeout(this.timout);
    this.medias.video=false;
    const obj=this.videoRef.nativeElement.srcObject;
    if(obj){
      const a=obj.getVideoTracks()[0]
      a.enable=false;
      a.stop();
    }
    if(cancel) this.modal.dismiss(null,"cancel");
  }

  /** check QR code */
  checkImage(){
    const video=this.videoRef.nativeElement;
    const width=video.clientWidth;
    const height=video.clientHeight;
    const canvas=this.canvasRef.nativeElement;
    canvas.width=width;
    canvas.height=height;
    //context
    const context=canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(video,0,0,width,height);
    const imageData=context.getImageData(0,0,width,height);
    const code=jsQR(imageData.data,width,height,{inversionAttempts:'attemptBoth'});
    if(code){
      console.log("code:",code);
      this.stopScan(false);
      //have result
      switch(this.type){
        /** pure scan code */
        case 'raw':{
          this.done('ok',{raw:code})
        }
        break;
        /** data only */
        case 'code':{
          this.done('ok',{code:code.data})
        }
        break;
        /** analysis */
        case 'analysis':{
          const result=analysisCode(code.data,this.formats);
          if(!result) {
            this.disp.msgbox(`analysis code NG<br>code:${code.data}`);
            return this.done('error')
          }
          this.done('ok',{analysis:result})
        }
        break;
        default:
          console.log("\n### ERROR: out of case")
      }
      return;
   
    }
    
    this.timout=setTimeout(()=>this.checkImage(),100);
  }

  /** exit scan code */
  done(role:QRcodePageRole='ok',data?:QRcodePageOutsOpts){
    const out=createQRcodePageOut(data);
    this.modal.dismiss(out,role)
  }

  //background /////////////////
  private _getDevices(kind:MediaDeviceKind|"All"):Promise<MediaDeviceInfo[]>{
    return new Promise((resolve,reject)=>{
      navigator.mediaDevices.enumerateDevices()
      .then(devices=>{
        devices=kind=="All"?devices:devices.filter(d=>d.kind==kind);
        return resolve(devices);
      })
      .catch(err=>reject(err))
    })
  }


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
}