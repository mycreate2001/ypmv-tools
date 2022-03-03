import { Component, OnInit } from '@angular/core';
import { ToolDetailPage } from '../../modals/model/model.page';
import { DisplayService } from '../../services/display/display.service';
import { fake } from '../../utils/fakedata'
import { getList } from '../../utils/minitools';
import { ModelData, ToolData } from '../../models/tools.model';
import { searchObj, separateObj } from 'src/app/utils/data.handle';
interface ModelExtend {
  tools:ToolData[];
  model:ModelData;
}

interface viewData {
  group:string;
  models:ModelExtend[]
}

@Component({
  selector: 'app-tools',
  templateUrl: './tools.page.html',
  styleUrls: ['./tools.page.scss'],
})
export class ToolsPage implements OnInit {
  views:viewData[]=[];
  origin:viewData[]=[];
  groups:string[]=[];
  key:string="";
  models:ModelData[]=[];
  tools:ToolData[]=[];
  constructor(
    private disp:DisplayService
  ) {
    ///
    const names=[
      "Electric drill","Circular saw","Soldering iron","Electric screwdriver","Chainsaw",
      "Nail gun","Hammer","Screwdriver","Mallet","Axe","Saw"
    ]
    const images=[
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQLGiJXUT7lcXk00IiIxiRSIVSo9n3uDxUNg&usqp=CAU",
      "https://www.bosch-professional.com/binary/ocsmedia/optimized/750x422/o64925v54_GKS190_CS_pr-02.png",
      "https://sc04.alicdn.com/kf/HLB1HPqcUwHqK1RjSZJnq6zNLpXaS.jpg" ,
      "https://5.imimg.com/data5/HY/XH/MY-19210072/electric-screw-driver-500x500.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd0q1U7HmmEYy7OiiB6_j7JZpBs_hQkZ3eYg&usqp=CAU", 
      "https://cdn-amz.fadoglobal.io/images/I/61FrdJ8rXTL._SR200,200_.jpg", 
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKH0xUpZ7MMU66kYlbNfm_gDG9XYuBAZm9-Q&usqp=CAU", 
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqQFRXUB9wbafVpf5DsIc3dn2dlfsAAgj_AQ&usqp=CAU", 
      "https://cdn.tatmart.com/images/detailed/41/bua_owok-xe.jpg", 
      "https://www.gransforsbruk.com/wp-content/uploads/475-large-carving-axe-1440x1026.jpg", 
      "https://rukminim1.flixcart.com/image/416/416/jk2w7m80/multi-vise-tool/j/b/d/hand-saw-heavy-duty-plastic-handle-16-abbyhus-original-imaf7gkrbgg2zhtf.jpeg?q=70",       
    ]
    this.groups=["standard tools","Spare parts","Jigs"];
    this.models=fake(names.length,{id:'%i%',name:names,group:this.groups,maintenance:100,image:images}) as ModelData[];
    this.tools=fake(1000,
      {
        id:'%i%%N%',
        startUse:new Date(),
        endUse:'',
        lastMaintenance:new Date(),
        vitual:0,
        operation:0,
        function:0,
        model:getList(this.models)
      }
    );
      console.log("initvalue",{tools:this.tools,models:this.models})
  }

  ngOnInit() {
    this.update();
  }

  /** update data */

  //////////// ------------ Handle function -------------------
  async showDetail(model?:ModelData){
    const modelEx=model?JSON.parse(JSON.stringify(model)):null;
    const ip=modelEx?{modelEx,groups:this.groups}:{groups:this.groups}
    const {role,data}=await this.disp.showModal(ToolDetailPage,{...ip});
    if(role.toLowerCase()!='ok') return;
    console.log({data});
  }

  update(){
    const models=this.key.length>=2?searchObj(this.key,this.models):this.models;
    this.views=this.makeView(models)
  }

  makeView(models:ModelData[]):viewData[]{
    let groups= separateObj(models,"group",{dataName:'models'});  //group=[{group,models}]
    const results:viewData[]=groups.map(g=>{
      const models:ModelExtend[]=g.models.map(m=>{
        const tools=this.tools.filter(t=>t.model==m.id);
        return {tools,model:m}
      })
      return {group:g.group,models}
    });
    return results;
  } 

}
