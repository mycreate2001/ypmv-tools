import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ModelPageRoutingModule } from './model-routing.module';

import { ModelPage } from './model.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule
    // ModelPageRoutingModule
  ],
  declarations: [ModelPage]
})
export class ModelPageModule {}
