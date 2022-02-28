import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { compareObject } from 'src/app/shares/minitools';
import { ModelData } from 'src/app/shares/tools.model';

@Component({
  selector: 'app-tool-detail',
  templateUrl: './tool-detail.page.html',
  styleUrls: ['./tool-detail.page.scss'],
})
export class ToolDetailPage implements OnInit {
  model:ModelData;
  groups:string[]=[];
  backup:ModelData;
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
