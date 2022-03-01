import { Injectable } from '@angular/core';
import { ActionSheetController, ActionSheetOptions, ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  constructor(
    private modal:ModalController,
    private act:ActionSheetController
    ) { }

  /**
   * show modal page
   * @param component page
   * @param props params ex:{item1:1,item2:2}
   * @param backdrop enable backdrop dismiss
   * @returns data
   */
  async showModal(component,props={},backdrop:boolean=false){
    const _props=JSON.parse(JSON.stringify(props))
    const modal=await this.modal.create({
      component,
      componentProps:_props,
      backdropDismiss:backdrop
    })
    await modal.present();
    return await modal.onDidDismiss();
  }

  async selectAction(opts:ActionSheetOptions){
    const act=await this.act.create(opts);
    act.present();
    return await act.onDidDismiss();
  }
}
