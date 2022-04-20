import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ToolPageRoutingModule } from './tool-routing.module';

import { ToolPage } from './tool.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';
import { DbPipeModule } from 'src/app/pipes/db/db.pipe.module';
import { StatusPipeModule } from 'src/app/pipes/status/status.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule,
    DbPipeModule,
    StatusPipeModule
    // ToolPageRoutingModule
  ],
  declarations: [ToolPage]
})
export class ToolPageModule {}
