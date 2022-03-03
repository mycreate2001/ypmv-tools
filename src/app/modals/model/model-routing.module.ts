import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToolDetailPage } from './model.page';

const routes: Routes = [
  {
    path: '',
    component: ToolDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolDetailPageRoutingModule {}
