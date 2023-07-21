import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';
import { OrderListResolveService } from 'src/app/services/orderResolve/order-list-resolve.service';
import { ToolsResolver } from 'src/app/services/tools.resolver';
import { CoversResolver } from 'src/app/services/covers.resolver';
import { ModelsResolver } from 'src/app/services/models.resolver';
// import { ToolDetailResolver } from 'src/app/services/tool-detail.resolver';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children:[
      {
        path:'tools',
        resolve:{
          tools:ToolsResolver,
          covers:CoversResolver,
          models:ModelsResolver
        },
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
        path: 'tools/:id',
        loadChildren: () => import('../../modals/tool/tool.module').then( m => m.ToolPageModule)
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
