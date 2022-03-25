import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchCompanyPage } from './search-company.page';

const routes: Routes = [
  {
    path: '',
    component: SearchCompanyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchCompanyPageRoutingModule {}
