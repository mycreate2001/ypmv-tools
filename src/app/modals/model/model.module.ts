import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ToolDetailPageRoutingModule } from './model-routing.module';

import { ToolDetailPage } from './model.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ToolDetailPageRoutingModule
  ],
  declarations: [ToolDetailPage]
})
export class ToolDetailPageModule {}
