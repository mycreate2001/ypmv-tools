import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import jsQR from 'jsqr'
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { analysisCode, CodeFormatData } from 'src/app/models/codeformat';

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

  /** variable */
  private medias:MediaStreamConstraints={
    video:{facingMode:'environment',deviceId:''},
    audio:false
  };
  cameras:any[]=[];
  cameraPos:number=0;
  title:string="default camera";
  private timout:any=null;
  formats:CodeFormatData[]=[];
  private formatDb:any;
  resultType:QRResultType='analysis';
  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService,
    private disp:DisplayService
  ) {
    this.formatDb=this.db.connect('formats');
    this.formatDb.onUpdate((formats)=>this.formats=formats);
  }

  ngOnInit() {
    navigator.mediaDevices.enumerateDevices()
    .then(cameras=>{
      this.cameras=cameras.filter(c=>c.kind=='videoinput');
      this.medias.video={facingMode:{ideal:'environment'}};
      //get from last times
      let deviceId=localStorage.getItem(_LOCAL_DEVICEID);
      if(deviceId){
        this.medias.video={deviceId};
        this.cameraPos=this.cameras.findIndex(x=>x.deviceId==deviceId)
      }
      this.scan();
    })
  }

  ngOnDestroy(){
    this.formatDb.disconnect();
  }

  scan(){
    navigator.mediaDevices.getUserMedia(this.medias)
    .then((stream:MediaStream)=>{
      this.videoRef.nativeElement.srcObject=stream;
      this.checkImage();
    })
    .catch(err=>{
      console.log("***ERR ***\nstart video error");
      console.dir(err);
      this.modal.dismiss(err.message,"error")
    })
  }

  changeCamera(){
    if(++this.cameraPos>=this.cameras.length) this.cameraPos=0
    //select manual
    const camera=this.cameras[this.cameraPos];
    localStorage.setItem(_LOCAL_DEVICEID,camera.deviceId);//save for next times
    this.stopScan(false);
    this.medias.video={deviceId:this.cameras[this.cameraPos].deviceId}
    this.title=this.cameras[this.cameraPos].label
    this.scan();
  }

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
      switch(this.resultType){
        /** pure scan code */
        case 'pure data':{
          this.modal.dismiss(code,'ok');
        }
        break;
        /** data only */
        case 'data only':{
          this.modal.dismiss(code.data,'ok');
        }
        break;
        /** analysis */
        case 'analysis':{
          const result=analysisCode(code.data,this.formats);
          if(!result) {
            this.disp.msgbox(`analysis code NG<br>code:${code.data}`);
            this.modal.dismiss(null,'code error');
          }
          else this.modal.dismiss(result,'OK');
        }
        break;
        default:
          console.log("ERROR: out of case")
      }
      return;
   
    }
    
    this.timout=setTimeout(()=>this.checkImage(),100);
  }

}