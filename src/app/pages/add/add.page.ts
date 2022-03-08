import { Component, OnInit } from '@angular/core';
import { ModelData, ToolData } from 'src/app/models/tools.model';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { QrcodePage } from '../../modals/qrcode/qrcode.page';
import { DisplayService } from '../../services/display/display.service';
interface ScanData{
  model:ModelData;
  tools:ToolData[];
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
    let result=await this.disp.showModal(QrcodePage);
    
    if(result.role.toLowerCase()!='ok'){console.log("cancel"); return;}
    const toolId=result.data['toolId'] as string;
    if(!toolId) return this.disp.msgbox("Not exist tool ID");
    const tool=this.tools.find(t=>t.id==toolId);
    if(!tool) return this.disp.msgbox(`Not exist this tool '${toolId}' on db`);
    const scan=this.scans.find(s=>s.model.id==tool.model);
    if(!scan){//not exist --> add new
      const model=this.models.find(m=>m.id==tool.model);
      if(!model) return this.disp.msgbox(`this model'${tool.id}' not yet register`);
      this.scans.push({model,tools:[tool]});
      return;
    }
    //add more tool
    scan.tools.push(tool);
  }
}
