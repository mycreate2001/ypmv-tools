import { Component, OnInit } from '@angular/core';
import {  _DB_COMPANY } from 'src/app/interfaces/company.model';
import { CoverData, _DB_COVERS } from 'src/app/interfaces/cover.interface';
import { ToolData, _DB_TOOLS } from 'src/app/interfaces/tools.model';
import { _DB_USERS } from 'src/app/interfaces/user.model';
import { FirestoreService } from 'src/app/services/firebase/firestore.service-2';

@Component({
  selector: 'app-fix',
  templateUrl: './fix.page.html',
  styleUrls: ['./fix.page.scss'],
})
export class FixPage implements OnInit {

  constructor(private db:FirestoreService) { }

  async ngOnInit() {
    // this.fixTarget();
    // this.fixTarget2();
  }


}
