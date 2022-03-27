import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoriesPageRoutingModule } from './histories-routing.module';

import { HistoriesPage } from './histories.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';
import { DbPipeModule } from 'src/app/pipes/db/db.pipe.module';
import { FirestorageImageSizePipeModule } from 'src/app/pipes/firestorage-image-size/firestorage-image-size.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoriesPageRoutingModule,
    UrlPipeModule,
    DbPipeModule,
    FirestorageImageSizePipeModule
  ],
  declarations: [HistoriesPage]
})
export class HistoriesPageModule {}
