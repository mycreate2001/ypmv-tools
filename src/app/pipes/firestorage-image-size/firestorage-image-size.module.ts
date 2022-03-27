import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestorageImageSizePipe } from './firestorage-image-size.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FirestorageImageSizePipe
  ],
  declarations: [
    FirestorageImageSizePipe
  ]
})
export class FirestorageImageSizePipeModule { }