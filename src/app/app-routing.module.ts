import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './guards/login/login.guard';

const routes: Routes = [
  {
    path:'',
    redirectTo:'histories',
    pathMatch:'full'
  },
  {
    path: 'camera',
    canActivate:[LoginGuard],
    loadChildren: () => import('./modals/camera/camera.module').then( m => m.CameraPageModule)
  },
  {
    path: 'qrcode',
    loadChildren: () => import('./modals/qrcode/qrcode.module').then( m => m.QrcodePageModule)
  },
  {
    path: 'tool',
    canActivate:[LoginGuard],
    loadChildren: () => import('./modals/tool/tool.module').then( m => m.ToolPageModule)
  },
  {
    path: 'search-tool',
    canActivate:[LoginGuard],
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
  {
    path: 'tools',
    canActivate:[LoginGuard],
    loadChildren: () => import('./pages/tools/tools.module').then( m => m.ToolsPageModule)
  },
  {
    path: 'model',
    loadChildren: () => import('./modals/model/model.module').then( m => m.ModelPageModule)
  },
  {
    path: 'format-detail',
    canActivate:[LoginGuard],
    loadChildren: () => import('./modals/format-detail/format-detail.module').then( m => m.FormatDetailPageModule)
  },
  {
    path: 'setting',
    canActivate:[LoginGuard],
    loadChildren: () => import('./pages/setting/setting.module').then( m => m.SettingPageModule)
  },
  {
    path:'formats',
    canActivate:[LoginGuard],
    loadChildren:()=>import('./pages/formats/formats.module').then(m=>m.FormatsPageModule)
  },
  {
    path: 'profile',
    canActivate:[LoginGuard],
    loadChildren: () => import('./modals/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'image-view',
    loadChildren: () => import('./modals/image-view/image-view.module').then( m => m.ImageViewPageModule)
  },
  {
    path: 'companies',
    loadChildren: () => import('./pages/companies/companies.module').then( m => m.CompaniesPageModule)
  },
  {
    path: 'company',
    loadChildren: () => import('./modals/company/company.module').then( m => m.CompanyPageModule)
  },
  {
    path: 'booking',
    loadChildren: () => import('./modals/booking/booking.module').then( m => m.BookingPageModule)
  },
  {
    path: 'histories',
    loadChildren: () => import('./pages/histories/histories.module').then( m => m.HistoriesPageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
