import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  constructor(private modal:ModalController) { }

  async showModal(component,props={}){
    const modal=await this.modal.create({
      component,
      componentProps:props
    })
    await modal.present();
    return await modal.onDidDismiss();
  }
}
