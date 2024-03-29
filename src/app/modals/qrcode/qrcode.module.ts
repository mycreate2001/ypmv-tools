import { NgModule } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { QrcodePageRoutingModule } from './qrcode-routing.module';

import { QrcodePage } from './qrcode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZXingScannerModule
    // QrcodePageRoutingModule
  ],
  declarations: [QrcodePage]
})
export class QrcodePageModule {}
