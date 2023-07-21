import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ActionSheetOptions, AlertController, 
          AlertOptions, LoadingController, ModalController, PopoverController, ToastController, ToastOptions } from '@ionic/angular';
import { Mode, PopoverAttributes, PopoverSize, PositionAlign, PositionReference, PositionSide } from '@ionic/core';
import { MenuPage } from 'src/app/modals/menu/menu.page';
import { MenuData } from 'src/app/interfaces/util.model';
export interface ShowMenuOpts{
  showBackdrop?: boolean;
  backdropDismiss?: boolean;
  translucent?: boolean;
  cssClass?: string | string[];
  event?: Event;
  animated?: boolean;
  mode?: Mode;
  keyboardClose?: boolean;
  id?: string;
  htmlAttributes?: PopoverAttributes;
  size?: PopoverSize;
  dismissOnSelect?: boolean;
  reference?: PositionReference;
  side?: PositionSide;
  alignment?: PositionAlign;
  arrow?: boolean;
  trigger?: string;
  triggerAction?: string;
}
@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  constructor(
    private modal:ModalController,
    private act:ActionSheetController,
    private alert:AlertController,
    private popover:PopoverController,
    private router:Router,
    private toast:ToastController,
    private loading:LoadingController
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
      componentProps:_props,
      backdropDismiss:backdrop,
      mode:'ios'
    })
    modal.present();
    return await modal.onDidDismiss();
  }

   /** show toast */
   async showToast(msg:string|string[],props:ToastOptions={}){
    const duration:number=props.duration|| 2000;
    const _msg=[].concat(msg)
    const toast=await this.toast.create({
      ...props,
      duration,
      message:_msg.join("<br>")
    })
    toast.present();
  }

  async showLoading(message:string="pls waiting..."){
    const loading=await this.loading.create({message});
    loading.present();
    await loading.onDidDismiss();
    return loading
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

  async showMenu(event:any,props:MenuPropsOpts,opts?:ShowMenuOpts){
    const popover=await this.popover.create({
      event,
      component:MenuPage,
      componentProps:props,
      ...opts
    })
    await popover.present();
    return await popover.onDidDismiss();
  }

  goto(url:string){
    return this.router.navigateByUrl(url);
  }
}

export interface MenuPropsOpts{
  menus:MenuData[]
}
