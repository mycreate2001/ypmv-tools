import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';
import { OrderListResolveService } from 'src/app/services/orderResolve/order-list-resolve.service';

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
        resolve:{orders:OrderListResolveService},
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
      {
        path: '',
        redirectTo: '/tabs/orders',
        pathMatch: 'full'
      }
    ]
  },
  {
    path:'',
    redirectTo:'/tabs/orders',
    pathMatch:'full'
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
