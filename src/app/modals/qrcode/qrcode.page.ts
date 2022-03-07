import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import jsQR from 'jsqr'
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { analysisCode, CodeFormatData } from 'src/app/models/codeformat';

export declare type QRResultType = 'pure data' | 'data only' | 'analysis';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.page.html',
  styleUrls: ['./qrcode.page.scss'],
})
export class QrcodePage implements OnInit {
  /** viewchild */
  @ViewChild('video',{static:false}) videoRef:ElementRef;
  @ViewChild('canvas',{static:false}) canvasRef:ElementRef;

  /** veriable */
  private videoStart=false;
  private medias:MediaStreamConstraints={
    video:false,
    audio:false
  };
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
    
  }

  ngAfterViewInit() {
    this.scan();
  }
  ngOnDestroy(){
    this.formatDb.disconnect();
  }

  scan(){
    this.medias.video=true;
    navigator.mediaDevices.getUserMedia(this.medias)
    .then((stream:MediaStream)=>{
      this.videoRef.nativeElement.srcObject=stream;
      this.videoStart=true;
      this.checkImage();
    })
    .catch(err=>{
      this.videoStart=false;
      console.log("***ERR ***\nstart video error");
      console.dir(err);
    })
  }

  stopScan(cancel=true){
    if(this.timout) clearTimeout(this.timout);
    this.medias.video=false;
    const a=this.videoRef.nativeElement.srcObject.getVideoTracks()[0];
    a.enable=false;
    a.stop();
    this.videoStart=false;
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
