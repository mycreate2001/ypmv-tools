import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { FormatDetailPageRoutingModule } from './format-detail-routing.module';

import { FormatDetailPage } from './format-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // FormatDetailPageRoutingModule
  ],
  declarations: [FormatDetailPage]
})
export class FormatDetailPageModule {}
