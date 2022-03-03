import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tools',
        loadChildren: () => import('../tools/tools.module').then( m => m.ToolsPageModule)
      },
      {
        path: 'model',
        loadChildren: () => import('../../modals/model/model.module').then( m => m.ToolDetailPageModule)
      },
      {
        path: 'add',
        loadChildren: () => import('../add/add.module').then( m => m.ScanPageModule)
      },
      {
        path: 'format-detail',
        loadChildren: () => import('../../modals/format-detail/format-detail.module').then( m => m.FormatDetailPageModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('../setting/setting.module').then( m => m.SettingPageModule)
      },
      {
        path:'formats',
        loadChildren:()=>import('../formats/formats.module').then(m=>m.FormatsPageModule)
      },

      {
        path: '',
        redirectTo: '/tabs/tools',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tools',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
