import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MchModelSearchPageRoutingModule } from './mch-model-search-routing.module';

import { MchModelSearchPage } from './mch-model-search.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MchModelSearchPageRoutingModule,
    UrlPipeModule
  ],
  declarations: [MchModelSearchPage]
})
export class MchModelSearchPageModule {}
