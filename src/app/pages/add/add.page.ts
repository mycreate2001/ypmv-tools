import { Component, OnInit } from '@angular/core';
import { ActionSheetButton } from '@ionic/angular';
import { ToolPage } from 'src/app/modals/tool/tool.page';
import { ModelData, ToolData } from 'src/app/models/tools.model';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { QrcodePage } from '../../modals/qrcode/qrcode.page';
import { DisplayService } from '../../services/display/display.service';
interface ScanData{
  model:ModelData;
  tool:ToolData;
}

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class ScanPage implements OnInit {
  tools:ToolData[]=[];
  models:ModelData[]=[];
  toolDb:ConnectData;
  modelDb:ConnectData;
  scans:ScanData[]=[];
  constructor(
    private disp:DisplayService,
    private db:FirestoreService
  ){
    this.toolDb=this.db.connect('tools');
    this.toolDb.onUpdate((tools:ToolData[])=>{
      this.tools=tools;
    })
    this.modelDb=this.db.connect('models');
    this.modelDb.onUpdate((models:ModelData[])=>{
      this.models=models;
    })
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.toolDb.disconnect();
    this.modelDb.disconnect();
  }

  async qrcode(){
    //scan
    let result=await this.disp.showModal(QrcodePage);
    if(result.role.toLowerCase()!='ok') return;
    //toolid
    const toolId=result.data['toolId'] as string;
    if(!toolId) return this.disp.msgbox("Not exist tool ID");
    //already scan or rnot
    if(this.scans.find(s=>s.tool.id==toolId)) return this.disp.msgbox(`tool '${toolId}' already in list`);
    //tool
    const tool=this.tools.find(t=>t.id==toolId);
    if(!tool) return this.disp.msgbox(`This tool '${toolId}' not yet register<br>pls register it`);
    const model=this.models.find(m=>m.id==tool.model);
    if(!model) return this.disp.msgbox("model '${tool.model}' is not yet register<br>pls register it!");
    this.scans.push({model,tool})
    this.detail({model,tool});
  }

  /** button handle detail */
  async detail(scan){
    const btns={back:'close'}
    const result=await this.disp.showModal(ToolPage,{...scan,btns})
    console.log("result\n",result);
  }

  async next(){
    const buttons:ActionSheetButton[]=[
      {
        text:'Reservation',
        handler:()=>{
          //check condition

          //update to service
          
        }
      }
    ]
    let modal=await this.disp.selectAction({mode:'ios',header:'Which action for next?',buttons:["Cancel"]})
  }
}
