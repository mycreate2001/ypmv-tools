import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Scan2PageRoutingModule } from './scan2-routing.module';

import { Scan2Page } from './scan2.page';
import { ZXingScannerModule } from '@zxing/ngx-scanner'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Scan2PageRoutingModule,
    ZXingScannerModule
  ],
  declarations: [Scan2Page]
})
export class Scan2PageModule {}
