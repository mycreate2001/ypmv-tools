import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MchModelSearchPage } from './mch-model-search.page';

const routes: Routes = [
  {
    path: '',
    component: MchModelSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MchModelSearchPageRoutingModule {}
