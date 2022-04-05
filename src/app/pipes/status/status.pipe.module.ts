import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusPipe } from './status.pipe';
// import { StatusPipe } from './status.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    StatusPipe
  ],
  declarations: [
    StatusPipe
  ]
})
export class StatusPipeModule { }