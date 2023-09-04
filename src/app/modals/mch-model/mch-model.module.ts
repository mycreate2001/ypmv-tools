import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MchModelPageRoutingModule } from './mch-model-routing.module';

import { MchModelPage } from './mch-model.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MchModelPageRoutingModule,
    UrlPipeModule
  ],
  declarations: [MchModelPage]
})
export class MchModelPageModule {}
