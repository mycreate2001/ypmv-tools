import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbPipe } from './db.pipe';


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    DbPipe
  ],
  declarations: [
    DbPipe
  ]
})
export class DbPipeModule { }