import { Component, OnInit } from '@angular/core';
import { MchModelSearchPage, MchModelSearchPageInput } from 'src/app/modals/mch-model-search/mch-model-search.page';
import { DisplayService } from 'src/app/services/display/display.service';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.page.html',
  styleUrls: ['./dev.page.scss'],
})
export class DevPage implements OnInit {

  constructor(private disp:DisplayService) { }

  ngOnInit() {
  }

  /** MchModeSearch */
  openMchModelSearch(){
    const props:MchModelSearchPageInput={

    }
    this.disp.showModal(MchModelSearchPage,props)
  }
}
