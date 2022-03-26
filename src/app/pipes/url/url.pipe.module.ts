import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrlPipe } from './url.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    UrlPipe
  ],
  declarations: [
    UrlPipe
  ]
})
export class UrlPipeModule { }