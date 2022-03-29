import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ToolStatusPageRoutingModule } from './tool-status-routing.module';

import { ToolStatusPage } from './tool-status.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';
import { StatusPipe } from 'src/app/pipes/status/status.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule
    // ToolStatusPageRoutingModule
  ],
  declarations: [ToolStatusPage,StatusPipe]
})
export class ToolStatusPageModule {}
