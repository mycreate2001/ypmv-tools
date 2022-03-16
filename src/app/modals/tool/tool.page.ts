import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModelData, ToolData } from 'src/app/models/tools.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import QrCreator from 'qr-creator';
const _DB_TOOL='tools'
@Component({
  selector: 'app-tool',
  templateUrl: './tool.page.html',
  styleUrls: ['./tool.page.scss'],
})
export class ToolPage implements OnInit {
  /** variable */
  tool:ToolData;
  model:ModelData;
  isNew:boolean=false;
  isEdit:boolean=false;
  editEnable:boolean=true;
  visualStatus=['OK','Scratch','broken'];
  operationStatus=['OK','cannot operation'];
  functionStatus=['OK',"tolerance's out of specs"];
  mItems=[
    {n:"Part No",v:"id"},
    {n:"Part Name",v:"name"},
    {n:"Category",v:"group"},
    {n:"Maintenance Period [days]",v:"maintenance"}
  ]
  /** function */
  constructor(
    private modal:ModalController,
    private db:FirestoreService
  ) {

  }

  ngOnInit() {
    if(this.isNew) this.isEdit=true;
    if(this.tool.stay)
    console.log("initial data:",this);
  }

  done(role:string="OK"){
    return this.modal.dismiss(this.tool,role);
  }

  /** print code */
  print(){
    const windowp=window.open('','','left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    windowp.document.write(`
      <style>
        canvas{ width: 32px;height: 32;} 
        .cover{display: flex;flex-direction: row;}
        .content{margin-left: 12px;}
        .code{font-size: x-small;}
      </style>`)
    windowp.document.write(`
      <div class="cover">
        <div id="qr-code"></div>
        <div class="content">
          <div class="label">${this.model.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</div>
          <div class="code">${this.tool.id}</div>
        </div>
      </div>`
    );
    QrCreator.render({
      text:"TL-"+this.tool.id,
      radius:0,
      ecLevel:'H',
      // fill:'#536DFE',
      background:null,
      // size:128
    }, windowp.document.querySelector('#qr-code'))
    console.log("query:",windowp.document.querySelector("#qr-code"))
    windowp.focus();
    // windowp.print();
    // windowp.close();
  }

  save(){
    this.db.add(_DB_TOOL,this.tool)
    .then(()=>this.done())
  }

  delete(){
    this.db.delete(_DB_TOOL,this.tool.id)
    this.done('delete')
  }

}
