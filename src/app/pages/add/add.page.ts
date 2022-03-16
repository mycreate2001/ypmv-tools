import { Component, OnInit } from '@angular/core';
import { ActionSheetButton } from '@ionic/angular';
import { BookingPage } from 'src/app/modals/booking/booking.page';
import { SearchToolPage } from 'src/app/modals/search-tool/search-tool.page';
import { ToolPage } from 'src/app/modals/tool/tool.page';
import { createBookingInfor, createToolStatus, ToolStatus } from 'src/app/models/bookingInfor.model';
import { ModelData, ToolData } from 'src/app/models/tools.model';
import { UserData } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/firebase/auth.service';
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

  /** variable */
  tools:ToolData[]=[];
  models:ModelData[]=[];
  toolDb:ConnectData;
  modelDb:ConnectData;
  scans:ScanData[]=[];
  user:UserData;
  /** function */
  constructor(
    private disp:DisplayService,
    private db:FirestoreService,
    private auth:AuthService
  ){
    this.toolDb=this.db.connect('tools');
    this.toolDb.onUpdate((tools:ToolData[])=>{
      this.tools=tools;
    })
    this.modelDb=this.db.connect('models');
    this.modelDb.onUpdate((models:ModelData[])=>{
      this.models=models;
    })
    //update user
    this.user=this.auth.currentUser;
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
    if(!toolId) return this.disp.msgbox("It's not tool ID code");
    const tool=this.tools.find(t=>t.id==toolId);
    if(!tool) return this.disp.msgbox(`This tool '${toolId}' not yet register<br>pls register it`);
    //in list?
    if(this.scans.find(({tools})=>tools.some(tool=>tool.id==toolId))) return this.disp.msgbox(`tool '${toolId}' already in list`)
    //model
    const model=this.models.find(m=>m.id==tool.model);
    if(!model) return this.disp.msgbox("model '${tool.model}' is not yet register<br>pls register it!");
    //add list
    const scan=this.scans.find(s=>s.model.id==model.id);
    if(scan)scan.tools=scan.tools.concat(tool);
    else this.scans.push({model,tools:[tool]})
  }

  /** button handle detail */
  async detail(scan){
    const btns={back:'close'}
    const result=await this.disp.showModal(ToolPage,{...scan,btns,editEnable:false})
    console.log("result\n",result);
  }

  /** button search */
  async search(){
    const result=await this.disp.showModal(SearchToolPage,{tools:this.tools,models:this.models});
    if(result.role.toUpperCase()!='OK') return;
    console.log("search:",result.data);
    const {model,tools}:ScanData=result.data;
    const scan=this.scans.find(s=>s.model.id==model.id);
    if(!scan){this.scans.push({model,tools})}
    else {
      tools.forEach(tool=>{
        if(scan.tools.find(x=>x.id==tool.id)) return;
        scan.tools.push(tool)
      })
    }
  }

  /** button next */
  nextAct(){
    //make toolstatus list
    const list:ToolStatus[]=[];
    this.scans.forEach(scan=>{
      const model=scan.model;
      scan.tools.forEach(tool=>{
        const data=createToolStatus({
          toolId:tool.id,
          group:model.group,
          name:model.name,
          visual:tool.visual,
          operation:tool.operation,
          function:tool.function,
          compQty:0,//@@@
          images:model.images.map(image=>{return{url:image,caption:''}})
        })
        list.push(data);
      })
    })
    console.log("userId:",this.user);
    const infor=createBookingInfor({scheduleTools:list,userId:this.user.id,createBy:this.user.name})
    this.disp.showModal(BookingPage,{infor})
    .then(result=>{
      if(result.role.toUpperCase()!='OK') {console.log("cancel by user");return}
      console.log("modal get result\n",result.data);
    })
  }
}
