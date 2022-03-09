import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModelData, ToolData } from 'src/app/models/tools.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';
import { getList } from 'src/app/utils/minitools';
interface SearchData{
  model:ModelData;
  tools:ToolData[]
}

interface ViewData{
  group:string;
  searchs:SearchData[];
}

@Component({
  selector: 'app-search-tool',
  templateUrl: './search-tool.page.html',
  styleUrls: ['./search-tool.page.scss'],
})
export class SearchToolPage implements OnInit {
  btns={
    back:{label:'Back',icon:'arrow-back-outline'},
    // done:{label:'Done',icon:'checkmark-done-circle-outline'},
  }
  key:string='';
  tools:ToolData[]=[];
  models:ModelData[]=[];
  views:ViewData[];
  cart:SearchData;
  constructor(
    private disp:DisplayService,
    private modal:ModalController
  ) {
    

  }

  ngOnInit() {
    this.search();
  }

  createViews(iModels:ModelData[]){
    const _models:SearchData[]=iModels.map(model=>{
      const tools:ToolData[]=this.tools.filter(t=>t.model==model.id);
      return {model,tools}
    })
    const groups:string[]=getList(iModels,"group");
    // this.views=separateObj(_models,"group",{dataName:'models'}) as ViewData;
    this.views=groups.map(group=>{
      const searchs:SearchData[]=_models.filter(m=>m.model.group==group);
      return {searchs,group}
    })
    
  }

  search(){
    const keyword=this.key.trim().toUpperCase();
    const models:ModelData[]=this.key==""?this.models:this.models
    .filter(model=>{
      return Object.keys(model).some(
        key=>(model[key]+"").trim().toUpperCase().includes(keyword)
      )
    })
    this.createViews(models);
    console.log("result",{views:this.views,filterModels:models,key:this.key});
  }

  /** hander select */
  async select(search:SearchData){
    const length=search.tools.length;
    if(!length) return this.disp.msgbox("This tool not availabel right now",{header:"ERROR"})
    let result=await this.disp.msgbox("Quantity=1~"+length,
    {
      header:'Input quantity',
      mode:'ios',
      inputs:[
        { type:'number',value:1,min:1,max:length,placeholder:'quantity'}
      ]
    });
    if(result.role.toUpperCase()!='OK') return;
    const qty=parseInt(result.data.values[0]);
    if(qty<1||qty>length) return this.disp.msgbox("Quantity is error<br>it should be 1 ~ "+length)
    console.log("result:",qty);
    //select tool
    const tools=bestChoice(search.tools,qty);
    this.cart={model:search.model,tools}
    this.done();
  }

  /** hander back */
  done(role:string=''){
    if(!role) role="OK"
    role=role.toUpperCase();
    return this.modal.dismiss(this.cart,role);
  }

}

function bestChoice<Type>(arrs:Type[],qty:number,opts?:any){
  //some logic
  const outs:Type[]=[]
  let i=0;
  arrs.some(a=>{
    i++;
    outs.push(a);
    return outs.length>=qty;
  });
  // console.log("bestchoice log",{i,outs,qty})
  return outs;
}
