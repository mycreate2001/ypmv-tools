import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MchModel, _DB_MCH_MODEL } from 'src/app/interfaces/mch-model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service-2';
import { MchModelPage, MchModelPageInput, MchModelPageOutput, MchModelPageRole } from '../mch-model/mch-model.page';
import { DisplayService } from 'src/app/services/display/display.service';

@Component({
  selector: 'app-mch-model-search',
  templateUrl: './mch-model-search.page.html',
  styleUrls: ['./mch-model-search.page.scss'],
})
export class MchModelSearchPage implements OnInit {
  /** input */
  masks:MchModel[]=[];
  isMulti:boolean=true;
  selectedIds:string[]=[];     // already selected before
  /** internal variable */
  mchModels:MchModel[]=[];
  keyword:string=''
  views:MchModel[]=[];      // results of search
  /** output */
  selects:MchModel[]=[];
  constructor(
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService
    ) {

  }
  
  ///////// SYSTEM ///////////////////
  async ngOnInit() {
    await this.getMchModels();//get MchModels
    //already select -- run first times
    const selecteds=this.mchModels.filter(x=>this.selectedIds.includes(x.id))
    this.selects=selecteds;
    this.search();
    
    console.log("init",this);
  }

  //////// BUTTONS ///////////////////
  done(role:MchModelSearchPageRole='ok'){
    if(role!=='ok') return this.modal.dismiss(null,role);
    const out:MchModelSearchPageOutput={
      selects:JSON.parse(JSON.stringify(this.selects))
    }
    this.modal.dismiss(out,role)
  }

  /** select action */
  select(model:MchModel){
    const pos:number=this.selects.findIndex(m=>m.id===model.id);
    if(pos==-1) {
      this.selects.push(model)
      if(this.isMulti) this.search();
      else this.done('ok');
    }
  }

  /** search */
  search(){
    const keywords:string[]=this.keyword
      .toLowerCase().split(/\w+\s/g).filter(x=>!!x)
    //filter by mask
    const maskIds=this.masks.map(m=>typeof m==='string'?m:m.id);
    //filter by selects
    const selectIds:string[]=this.selects.map(x=>x.id);
    const removeIds:string[]=[...maskIds,...selectIds]
    const models:MchModel[]=this.mchModels.filter(m=>!removeIds.includes(m.id));
    //by keyword
    this.views=keywords.length?this._searchKeyword(keywords,models):models;
  }

  /**
   * The `detail` function is an asynchronous function that displays a modal with a `MchModelPage`
   * component, allows the user to make changes to the model, and updates the model if there are any
   * changes.
   * @param {MchModel} [model] - The `model` parameter is an optional object of type `MchModel`. It
   * represents a model that is passed to the `detail` function. If a `model` object is provided, it is
   * stringified and stored in the `modelBackup` variable for backup purposes. The `model`
   * @returns nothing (undefined).
   */
  async detail(e,model?:MchModel){
    if(e) e.stopPropagation();
    const modelBackup:string=model?JSON.stringify(model):'';//backup
    const props:MchModelPageInput={
      model
    }
    try{
      const result=await this.disp.showModal(MchModelPage,props)
      const role=result.role as MchModelPageRole;
      if(role!='ok') return;
      const data=result.data as MchModelPageOutput;
      const _model=data.model;
      // Nochange --> return
      if(JSON.stringify(_model)==modelBackup)
        return console.log("no change")
      //change --> updateModel
      await this.updateModel(_model);
      console.log(`mchModel '${_model.id}' was updated successfully!`)
    }
    catch(err){
      const msg=err instanceof Error?err.message:'other'
      this.disp.msgbox(`detail MchModel '${model?model.id:''}' error<br>${msg}`)
    }
    
  }


  //// BACKGROUNDS ///////////////////
  async getMchModels(){
    this.mchModels=await this.db.search(_DB_MCH_MODEL);
  }

  private _searchKeyword(keywords:string[],models:MchModel[]):MchModel[]{
    return models.filter(model=>{
      return Object.keys(model).some(key=>{
        const val:string=model[key]+''
        return keywords.some(keyword=>val.includes(keyword))
      })
    })
  }

  async updateModel(model:MchModel){
    if(!model||!model.id) return;
    const pos=this.mchModels.findIndex(md=>md.id===model.id);
    if(pos==-1){
      this.mchModels.push(model);//add to list
    }
    this.mchModels[pos]=model;
    await this.db.add(_DB_MCH_MODEL,model);
  }

}


/// interface ////////////////
export interface MchModelSearchPageInput{
  masks?:(MchModel|string)[];     // not select this model
  isMulti?:boolean;               // Enable mutil select
  selectedIds?:string[];         // already select
}

export type MchModelSearchPageRole="ok"|"back"|"error";//default=ok

export interface MchModelSearchPageOutput{
  selects:MchModel[];
}
