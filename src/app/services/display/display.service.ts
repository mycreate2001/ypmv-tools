import { Injectable } from '@angular/core';
import { ActionSheetController, ActionSheetOptions, AlertController, AlertOptions, ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  constructor(
    private modal:ModalController,
    private act:ActionSheetController,
    private alert:AlertController
    ) { }

  /**
   * show modal page
   * @param component page
   * @param props params ex:{item1:1,item2:2}
   * @param backdrop enable backdrop dismiss
   * @returns data
   */
  async showModal(component,props={},backdrop:boolean=false){
    const _props=JSON.parse(JSON.stringify(props));
    console.log("props:",_props);
    const modal=await this.modal.create({
      component,
      componentProps:props,
      backdropDismiss:backdrop,
      mode:'ios'
    })
    modal.present();
    return await modal.onDidDismiss();
  }

  async msgbox(msg:string,opts?:AlertOptions){
    const _opts:AlertOptions={header:'Information',buttons:[{text:'OK',role:'OK'}],...opts,message:msg}
    const alert=await this.alert.create(_opts)
    alert.present();
    return await alert.onDidDismiss();
  }

  async selectAction(opts:ActionSheetOptions){
    const act=await this.act.create(opts);
    act.present();
    return await act.onDidDismiss();
  }
}
