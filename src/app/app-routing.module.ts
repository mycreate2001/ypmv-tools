import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'camera',
    loadChildren: () => import('./modals/camera/camera.module').then( m => m.CameraPageModule)
  },
  {
    path: 'qrcode',
    loadChildren: () => import('./modals/qrcode/qrcode.module').then( m => m.QrcodePageModule)
  },
  {
    path: 'tool',
    loadChildren: () => import('./modals/tool/tool.module').then( m => m.ToolPageModule)
  },
  {
    path: 'search-tool',
    loadChildren: () => import('./modals/search-tool/search-tool.module').then( m => m.SearchToolPageModule)
  },
  {
    path: 'menu',
    loadChildren: () => import('./modals/menu/menu.module').then( m => m.MenuPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },




  

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
