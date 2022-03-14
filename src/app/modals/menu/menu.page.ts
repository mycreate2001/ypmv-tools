import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ColorType } from 'src/app/models/util.model';
export interface MenuData{
  name:string;
  handler?:Function;
  role?:string;
  icon?:string;
  iconColor?:ColorType;
}
@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  /** variable */
  menus:MenuData[]=[];

  constructor(private popover:PopoverController) { }

  ngOnInit() {
  }

  async close(pos){
    const menu=this.menus[pos];
    if(menu && menu.handler){
      await menu.handler(pos);
    }
    this.popover.dismiss(pos,menu.role);
  }

}
