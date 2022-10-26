import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { CoverPageRoutingModule } from './cover-routing.module';

import { CoverPage } from './cover.page';
import { UrlPipeModule } from '../../pipes/url/url.pipe.module';
import { DbPipeModule } from 'src/app/pipes/db/db.pipe.module';
import { StatusPipeModule } from 'src/app/pipes/status/status.pipe.module';
// import { UrlPipeModule } from '../../pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule,
    DbPipeModule,
    StatusPipeModule
    // CoverPageRoutingModule
  ],
  declarations: [CoverPage]
})
export class CoverPageModule {}
