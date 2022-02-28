import { Component, OnInit } from '@angular/core';
import { ToolDetailPage } from '../modals/tool-detail/tool-detail.page';
import { DisplayService } from '../services/display/display.service';
import { fake } from '../shares/fakedata'
import { getList } from '../shares/minitools';
import { ModelData } from '../shares/tools.model';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.page.html',
  styleUrls: ['./tools.page.scss'],
})
export class ToolsPage implements OnInit {
  /**
   * tools=[
   * {id:'001',name:'abc'},
   * {}
   * ]
   */
  views:any[]=[];
  groups:string[]=[];
  constructor(
    private disp:DisplayService
  ) {
    const names=["Electric drill","Circular saw","Soldering iron","Electric screwdriver","Chainsaw","Nail gun","Hammer","Screwdriver","Mallet","Axe","Saw"]
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
    const groups=["standard tools","Spare parts","Jigs"];
    this.groups=groups;
    const models=fake(names.length,{id:'%i%',name:names,group:groups,maintenance:100,image:images}) as ModelData[];
    let tools=fake(1000,
      {
        id:'%i%%N%',
        startUse:new Date(),
        endUse:'',
        lastMaintenance:new Date(),
        vitual:0,
        operation:0,
        function:0,
        model:getList(models)
      }
    );
    console.log({tools,groups,models})

    this.views=groups.map(group=>{
      return {
        group,
        models:models.filter(x=>x.group==group)
        .map(model=>{
          return {
            ...model,
            tools:tools.filter(y=>y.model==model.id)
          }
        })
      }
    })
    console.log("views:",this.views);
   }

  ngOnInit() {
  }

  async showDetail(model){
    const _model=JSON.parse(JSON.stringify(model));
    const {role,data}=await this.disp.showModal(ToolDetailPage,{model:_model,groups:this.groups});
    if(role.toLowerCase()!='ok') return;
    console.log({data});
  }

}
