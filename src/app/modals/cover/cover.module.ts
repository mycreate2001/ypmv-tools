import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { CoverPageRoutingModule } from './cover-routing.module';

import { CoverPage } from './cover.page';
import { UrlPipeModule } from '../../pipes/url/url.pipe.module';
// import { UrlPipeModule } from '../../pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule
    // CoverPageRoutingModule
  ],
  declarations: [CoverPage]
})
export class CoverPageModule {}
