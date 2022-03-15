import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.page.html',
  styleUrls: ['./companies.page.scss'],
})
export class CompaniesPage implements OnInit {
  companies=[
    { 
      name:"Yamaha Motor Parts Menufacturing Co.,ltd",
      image:'https://yamaha-motor.com.vn/wp/wp-content/webp-express/webp-images/doc-root/wp/wp-content/themes/yamaha/assets/img/share/logo-yamaha.png.webp',
      url:'https://yamaha-motor.com.vn/',
      id:'ypmv',
      phone:'18001588',
      email:'service@yamaha-motor.com.vn',
      address:'Blk 207 Henderson Road #01-02/03-02 Henderson Industrial Park Singapore 159550'
    },
    {
      name:'Trans-tec',
      image:'https://www.trans-tec.com/fontend/images/logo.svg',
      url:'https://www.trans-tec.com/',
      id:'trv',
      phone:'18001588',
      email:'service@yamaha-motor.com.vn',
      address:'Blk 207 Henderson Road #01-02/03-02 Henderson Industrial Park Singapore 159550'
    },

    {
      name:'',
      image:'https://images.glints.com/unsafe/160x0/glints-dashboard.s3.amazonaws.com/company-logo/7072fdeff8d12782721e582bdb782c56.png',
      url:'https://www.trans-tec.com/',
      id:'MTV',
      phone:'18001588',
      email:'service@yamaha-motor.com.vn',
      address:'Blk 207 Henderson Road #01-02/03-02 Henderson Industrial Park Singapore 159550'
    },
    {
      name:'Trans-tec',
      image:'https://www.trans-tec.com/fontend/images/logo.svg',
      url:'https://www.trans-tec.com/',
      id:'trv',
      phone:'18001588',
      email:'service@yamaha-motor.com.vn',
      address:'Blk 207 Henderson Road #01-02/03-02 Henderson Industrial Park Singapore 159550'
    },
    {
      name:'Trans-tec',
      image:'https://www.trans-tec.com/fontend/images/logo.svg',
      url:'https://www.trans-tec.com/',
      id:'trv',
      phone:'18001588',
      email:'service@yamaha-motor.com.vn',
      address:'Blk 207 Henderson Road #01-02/03-02 Henderson Industrial Park Singapore 159550'
    },
    {
      name:'Trans-tec',
      image:'https://www.trans-tec.com/fontend/images/logo.svg',
      url:'https://www.trans-tec.com/',
      id:'trv',
      phone:'18001588',
      email:'service@yamaha-motor.com.vn',
      address:'Blk 207 Henderson Road #01-02/03-02 Henderson Industrial Park Singapore 159550'
    },
    {
      name:'Trans-tec',
      image:'https://www.trans-tec.com/fontend/images/logo.svg',
      url:'https://www.trans-tec.com/',
      id:'trv',
      phone:'18001588',
      email:'service@yamaha-motor.com.vn',
      address:'Blk 207 Henderson Road #01-02/03-02 Henderson Industrial Park Singapore 159550'
    },

  ]
  constructor() { }

  ngOnInit() {
  }

}
