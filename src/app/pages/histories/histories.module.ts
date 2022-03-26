import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoriesPageRoutingModule } from './histories-routing.module';

import { HistoriesPage } from './histories.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoriesPageRoutingModule,
    UrlPipeModule
  ],
  declarations: [HistoriesPage]
})
export class HistoriesPageModule {}
