import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { BookingPageRoutingModule } from './booking-routing.module';

import { BookingPage } from './booking.page';
import { UrlPipeModule } from 'src/app/pipes/url/url.pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPipeModule
    // BookingPageRoutingModule
  ],
  declarations: [BookingPage]
})
export class BookingPageModule {}
