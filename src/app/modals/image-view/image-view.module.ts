import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ImageViewPageRoutingModule } from './image-view-routing.module';

import { ImageViewPage } from './image-view.page';
import { NgxImageCompressService } from 'ngx-image-compress';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // ImageViewPageRoutingModule
  ],
  providers:[
    NgxImageCompressService
  ],
  declarations: [ImageViewPage]
})
export class ImageViewPageModule {}
