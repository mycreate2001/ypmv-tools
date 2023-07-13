import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';
import { LoginGuard } from 'src/app/guards/login/login.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children:[
      {
        path:'tools',
        loadChildren:()=>import('../tools/tools.module').then(m=>m.ToolsPageModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('../orders/orders.module').then( m => m.OrdersPageModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('../setting/setting.module').then( m => m.SettingPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../../modals/profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path:'formats',
        loadChildren:()=>import('../formats/formats.module').then(m=>m.FormatsPageModule)
      },
    ]
  },
  {
    path:'',
    redirectTo:'tabs/tools',
    pathMatch:'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
