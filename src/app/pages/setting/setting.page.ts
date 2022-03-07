import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  constructor() { }
  pages=[
    {name:'Code format register',url:'/tabs/formats',icon:'qr-code'},//<ion-icon name="qr-code-outline"></ion-icon>
  ]
  ngOnInit() {
  }

}
