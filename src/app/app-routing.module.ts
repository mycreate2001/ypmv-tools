import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './guards/login/login.guard';

const routes: Routes = [
  {
    path:'',
    redirectTo:'tabs',
    pathMatch:'full'
  },
  //modal page
  {
    path: 'camera',
    loadChildren: () => import('./modals/camera/camera.module').then( m => m.CameraPageModule)
  },
  {
    path: 'qrcode',
    loadChildren: () => import('./modals/qrcode/qrcode.module').then( m => m.QrcodePageModule)
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
    path: 'model',
    loadChildren: () => import('./modals/model/model.module').then( m => m.ModelPageModule)
  },
  {
    path: 'format-detail',
    loadChildren: () => import('./modals/format-detail/format-detail.module').then( m => m.FormatDetailPageModule)
  },
  {
    path: 'image-view',
    loadChildren: () => import('./modals/image-view/image-view.module').then( m => m.ImageViewPageModule)
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
    path: 'cover',
    loadChildren: () => import('./modals/cover/cover.module').then( m => m.CoverPageModule)
  },
  {
    path: 'search-company',
    loadChildren: () => import('./modals/search-company/search-company.module').then( m => m.SearchCompanyPageModule)
  },

  //page
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'companies',
    canActivate:[LoginGuard],
    loadChildren: () => import('./pages/companies/companies.module').then( m => m.CompaniesPageModule)
  },
  {
    path: 'tool-status',
    loadChildren: () => import('./modals/tool-status/tool-status.module').then( m => m.ToolStatusPageModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./pages/users/users.module').then( m => m.UsersPageModule)
  },
  {
    path: 'tabs',
    canActivate:[LoginGuard],
    loadChildren: () => import('./pages/tabs/tabs.module').then( m => m.TabsPageModule)
  },


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
