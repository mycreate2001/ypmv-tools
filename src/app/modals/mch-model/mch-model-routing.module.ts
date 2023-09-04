import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MchModelPage } from './mch-model.page';

const routes: Routes = [
  {
    path: '',
    component: MchModelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MchModelPageRoutingModule {}
