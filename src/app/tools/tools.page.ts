import { Component, OnInit } from '@angular/core';
import { fake } from '../shares/fakedata'
import { getList } from '../shares/minitools';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.page.html',
  styleUrls: ['./tools.page.scss'],
})
export class ToolsPage implements OnInit {
  views:any[]=[];
  constructor() {
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
    const groups=["standard tools","Spare parts","Jigs"]
    let tools=fake(10,{id:'%i%%N%',name:names,image:images,group:groups});
    let grs=getList(tools,'group');
    this.views=grs.map(gr=>{
      return {
        group:gr,
        data:tools.filter(x=>x.group==gr)
      }
    })
    console.log("views:",this.views);
   }

  ngOnInit() {
  }

}
