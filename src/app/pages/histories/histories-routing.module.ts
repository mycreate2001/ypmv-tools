import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistoriesPage } from './histories.page';

const routes: Routes = [
  {
    path: '',
    component: HistoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistoriesPageRoutingModule {}
