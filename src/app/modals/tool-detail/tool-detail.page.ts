import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModelData } from 'src/app/models/tools.model';
interface ModelDataExtend extends ModelData{
  tools:any[]
}
@Component({
  selector: 'app-tool-detail',
  templateUrl: './tool-detail.page.html',
  styleUrls: ['./tool-detail.page.scss'],
})
export class ToolDetailPage implements OnInit {
  model:ModelDataExtend;
  groups:string[]=[];
  backup:ModelData;
  isDetail:boolean=false;
  constructor(
    private modal:ModalController
  ) {
    // console.log("model:",this.model);
    // this.backup=JSON.parse(JSON.stringify(this.model));
  }

  ngOnInit() {
    console.log("model:",this.model);
    this.backup=JSON.parse(JSON.stringify(this.model));
  }

  done(isSuccess:boolean=true){
    if(!isSuccess) return this.modal.dismiss(null,"cancel");
    console.log("save");
    return this.modal.dismiss(null,"ok");
  }

}
