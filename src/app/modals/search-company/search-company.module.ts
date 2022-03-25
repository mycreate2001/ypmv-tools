import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchCompanyPageRoutingModule } from './search-company-routing.module';

import { SearchCompanyPage } from './search-company.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchCompanyPageRoutingModule
  ],
  declarations: [SearchCompanyPage]
})
export class SearchCompanyPageModule {}
