import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormatDetailPage } from './format-detail.page';

const routes: Routes = [
  {
    path: '',
    component: FormatDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormatDetailPageRoutingModule {}
