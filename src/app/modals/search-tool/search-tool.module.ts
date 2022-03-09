import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchToolPageRoutingModule } from './search-tool-routing.module';

import { SearchToolPage } from './search-tool.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchToolPageRoutingModule
  ],
  declarations: [SearchToolPage]
})
export class SearchToolPageModule {}
