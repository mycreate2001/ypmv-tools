import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import jsQR from 'jsqr'

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
  videoStart=false;
  medias:MediaStreamConstraints={
    video:false,
    audio:false
  };
  timout:any=null;

  /** function */
  constructor(
    private modal:ModalController
  ) { }

  ngOnInit() {
    this.scan();
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
      console.log("start video error");
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
      this.modal.dismiss(code,'OK');
    }
    else{
      this.timout=setTimeout(()=>this.checkImage(),100);
    }
  }

}
