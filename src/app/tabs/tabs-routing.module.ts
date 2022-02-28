import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: 'tools',
        loadChildren: () => import('../tools/tools.module').then( m => m.ToolsPageModule)
      },
      {
        path: 'tool-detail',
        loadChildren: () => import('../modals/tool-detail/tool-detail.module').then( m => m.ToolDetailPageModule)
      },
      {
        path: 'scan',
        loadChildren: () => import('../scan/scan.module').then( m => m.ScanPageModule)
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
