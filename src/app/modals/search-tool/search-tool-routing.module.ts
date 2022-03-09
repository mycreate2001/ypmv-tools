import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchToolPage } from './search-tool.page';

const routes: Routes = [
  {
    path: '',
    component: SearchToolPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchToolPageRoutingModule {}
