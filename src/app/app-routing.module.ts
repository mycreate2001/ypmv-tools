import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'camera',
    loadChildren: () => import('./modals/camera/camera.module').then( m => m.CameraPageModule)
  },
  {
    path: 'qrcode',
    loadChildren: () => import('./modals/qrcode/qrcode.module').then( m => m.QrcodePageModule)
  },
  

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
