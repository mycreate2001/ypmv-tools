import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ColorType, MenuData } from 'src/app/interfaces/util.model';

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
      if(menu.value==undefined) 
      await menu.handler(pos);
    }
    this.popover.dismiss(pos,menu.role);
  }

}

export interface MenuPageOpts{
  menus:MenuData
}
