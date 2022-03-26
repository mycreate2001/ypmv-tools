import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ToolPageRoutingModule } from './tool-routing.module';

import { ToolPage } from './tool.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule
    // ToolPageRoutingModule
  ],
  declarations: [ToolPage]
})
export class ToolPageModule {}
