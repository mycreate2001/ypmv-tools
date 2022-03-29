import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BasicData, ChildData } from 'src/app/models/basic.model';
import { CoverData, _DB_COVERS} from '../../models/cover.model';
import { ModelData, ToolData, _DB_MODELS, _DB_TOOLS } from 'src/app/models/tools.model';
import { ButtonData, UrlData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService } from 'src/app/services/firebase/firestore.service';
import { getList } from 'src/app/utils/minitools';
import { ImageViewPage, ImageViewPageOpts, ImageViewPageOuts } from '../image-view/image-view.page';
import { SearchToolPage, SearchToolPageOpts, SearchToolPageOuts } from '../search-tool/search-tool.page';
import { ToolPage, ToolPageOpts } from '../tool/tool.page';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-cover',
  templateUrl: './cover.page.html',
  styleUrls: ['./cover.page.scss'],
})
export class CoverPage implements OnInit {
  /** input data */
  cover:CoverData;

  /** internal variable */
  children:BasicData[]=[];
  addImages:UrlData[]=[];
  delImages:string[]=[];
  viewImages:UrlData[]=[];
  isAvailble:boolean=false;
  buttons:ButtonData[]=[{role:'save',icon:'save'},{role:'delete',icon:'trash'}]
  constructor(
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService,
    public util:UtilService
  ) { }

  ngOnInit() {
    this._update();
  }

  /** update view for childrenId */
  private async _update(){//pls run one times
    //update data
    const coversId:string[]=this.cover.childrenId.filter(x=>x.type=='cover').map(y=>y.id)
    const covers:CoverData[]=await this.db.gets(_DB_COVERS,coversId);

    const toolsId:string[]=this.cover.childrenId.filter(x=>x.type=='tool').map(y=>y.id);
    const tools:ToolData[]=await this.db.gets(_DB_TOOLS,toolsId);
    const models:ModelData[]=await this.db.gets(_DB_MODELS, getList(tools,"model"))

    this.children=this.cover.childrenId.map(child=>{
      if(child.type=='cover'){
        const cover=covers.find(c=>c.id==child.id);
        if(!cover) return;
        const out:BasicData={
          ...child,
          name:cover.name,
          group:cover.group,
          images:cover.images
        }
        return out;
      }
      //tool
      if(child.type=='tool'){
        const tool:ToolData=tools.find(t=>t.id==child.id)
        if(!tool) return;
        const model:ModelData=models.find(m=>m.id==tool.model);
        if(!model) return;
        const out:BasicData={
          ...child,
          name:model.name,
          group:model.group,
          images:model.images
        }
        return out;
      }
      return;
    }).filter(x=>x);

    //update images
    this.viewImages=this.cover.images.concat(this.addImages);
    this.isAvailble=true;
    console.log("\n---------Refresh data -------\n",this);
  }

  done(role:string='OK'){
    const out:CoverPageOuts={
      cover:this.cover,
      addImages:this.addImages,
      delImages:this.delImages
    }
    this.modal.dismiss(out,role)
  }

  /** add/edit images */
  detailImage(){
    const props:ImageViewPageOpts={
      images:this.cover.images,
      addImages:this.addImages,
      delImages:this.delImages
    }
    this.disp.showModal(ImageViewPage,props)
    .then(result=>{
      const data=result.data as ImageViewPageOuts
      switch(result.role.toUpperCase()){
        case 'OK':
        case 'SAVE':{
          this.addImages=data.addImages
          this.delImages=data.delImages
          this.cover.images=data.images
          this.viewImages=this.cover.images.concat(this.addImages)
        }
        break;
      }
    })
  }

  /** print */
  print(){
    this.util.generaQRcode(this.cover.id,{label:this.cover.name,type:'cover',size:35})
  }

  /** add child */
  addChild(){
    const props:SearchToolPageOpts={
      type:'tool & cover',
      exceptionList:[...this.cover.childrenId,{id:this.cover.id,type:'cover'}]
    }
    this.disp.showModal(SearchToolPage,props)
    .then(result=>{
      const role=result.role.toUpperCase();
      const data=result.data as SearchToolPageOuts
      if(role!='SAVE'&&role!='OK') return;
      this.children=[...this.children,...data.search]
      this.cover.childrenId=data.search.map(x=>{return{id:x.id,type:x.type}});
    })
  }

  /** pickup cover */
  pickupCover(){
    const props:SearchToolPageOpts={
      type:'cover'
    }
    this.disp.showModal(SearchToolPage,props)
  }

  detail(child:ChildData){
    console.log("select child:",child)
    if(child.type=='cover'){
      this.db.get(_DB_COVERS,child.id)
      .then(cover=>{
        const props:CoverPageOpts={cover}
        return this.disp.showModal(CoverPage,props)
      })
      
    }
    else if(child.type=='tool'){
      const props:ToolPageOpts={toolId:child.id}
      this.disp.showModal(ToolPage,props)
    }
  }

}


/**
 * @param cover coverdata want to review/edit
 */
export interface CoverPageOpts{
  cover:CoverData;
}

/**
 * @param cover data
 * @param addImages images will add to server
 * @param delImages images will delete
 */
export interface CoverPageOuts{
  cover:CoverData;
  addImages:UrlData[];
  delImages:string[];
}
