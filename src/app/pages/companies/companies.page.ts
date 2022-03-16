import { Component, OnInit } from '@angular/core';
import { CompanyPage } from 'src/app/modals/company/company.page';
import { CompanyData, createCompanyData, _DB_COMPANY } from 'src/app/models/company.model';
import { MenuData } from 'src/app/models/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { ConnectData, FirestoreService } from 'src/app/services/firebase/firestore.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.page.html',
  styleUrls: ['./companies.page.scss'],
})
export class CompaniesPage implements OnInit {
  /** variable */
  companyDb:ConnectData;
  companies:CompanyData[]=[];
  views=[];
  keyword:string=''
  constructor(
    private disp:DisplayService,
    private db:FirestoreService
  ) {
    this.companyDb=this.db.connect(_DB_COMPANY);
    this.companyDb.onUpdate((companies)=>{
      this.companies=companies;
      this.update();
    })
  }

  ngOnInit() {
    this.update()
  }

  update(){
    if(!this.keyword) {
      this.views=this.companies;
      return;
    }
    this.views=this.companies
      .filter(
        c=>Object.keys(c).some(
          key=>(c[key]+"").toUpperCase().includes(this.keyword.toUpperCase())
        )
      )
    console.log("update",{keyword:this.keyword,views:this.views})
  }

  detail(company:CompanyData=null){
    if(!company) company=createCompanyData();
    this.disp.showModal(CompanyPage,{company})
    .then(result=>{
      if(result.role.toUpperCase()!='OK') return;
      console.log("data:",result.data)
    })
  }
  ////////// button hander //////////////
  menu(event){
    const menus:MenuData[]=[
      {
        name:'New',
        icon:'add-circle',//<ion-icon name="add-circle"></ion-icon>
        iconColor:'primary',
        handler:()=>this.detail()
      }
    ]
    this.disp.showMenu(event,{menus})
  }

}
