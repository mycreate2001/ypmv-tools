import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { SearchToolPageRoutingModule } from './search-tool-routing.module';

import { SearchToolPage } from './search-tool.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule
    // SearchToolPageRoutingModule
  ],
  declarations: [SearchToolPage]
})
export class SearchToolPageModule {}
