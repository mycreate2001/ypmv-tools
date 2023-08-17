import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CompanyData, CompanyType, _DB_COMPANY } from 'src/app/interfaces/company.model';
import { MenuData } from 'src/app/interfaces/util.model';
import { DisplayService } from 'src/app/services/display/display.service';
import { FirestoreService, QueryData } from 'src/app/services/firebase/firestore.service';
import { searchObj } from 'src/app/utils/data.handle';

@Component({
  selector: 'app-search-company',
  templateUrl: './search-company.page.html',
  styleUrls: ['./search-company.page.scss'],
})
export class SearchCompanyPage implements OnInit {
  /** database */
  companies:CompanyData[]=[];
  /** input */
  exceptionList:string[]=[];
  type:SearchCompanyType='any'
  mutilSelect:boolean=false;
  /** internal */
  keyword:string='' //it for searching
  carts:CompanyData[]=[];
  isAvailable:boolean=false;
  views:CompanyData[]=[];
  constructor(
    private db:FirestoreService,
    private modal:ModalController,
    private disp:DisplayService
  ) { }

  ngOnInit() {
    const queries:QueryData[]=this.type=='any'?[]:[{key:'type',type:'==',value:this.type}]
    this.db.search(_DB_COMPANY,queries)
    .then((companies:CompanyData[])=>{
      this.companies=companies;
      this.update();
    })
  }


  /** exit search company page */
  done(role:SearchCompanyPageRole='ok'){
    const outs:SearchCompanyPageOuts={
      companies:this.carts
    }
    this.modal.dismiss(outs,role)
  }

  /** select company */
  select(company:CompanyData){
    if(this.carts.find(c=>c.id==company.id)){console.log("already selected");return}
    this.carts.push(company);
    if(!this.mutilSelect) return this.done('ok')
    this.update();
  }

  showCart(event){
    const menus:MenuData[]=this.carts.map(cart=>{
      const menu:MenuData={
        image:cart.image.url,
        name:cart.name,
        note:cart.address
      }
      return menu
    })
    this.disp.showMenu(event,{menus})
  }

  ///// backgroup ///////////
  update(){
    //filter
    const companies=this.companies.filter(c=>!this.exceptionList.includes(c.id)&&!this.carts.find(x=>x.id==c.id))
    this.views=this.keyword?searchObj(this.keyword,companies):companies;
    this.isAvailable=true;
    console.log("update",this);
  }


}

//// interface ////

/**
  @param exceptionList?:string[];
  @param type?:CompanyType;
  @param mutilSelect?:boolean
 */
export interface SearchCompanyPageOpts{
  /** default empty */
  exceptionList?:string[];
  /** default any */
  type?:CompanyType;
  mutilSelect?:boolean
}

/**
 * @param companyId id of selected company
 */
export interface SearchCompanyPageOuts{
  companies:CompanyData[];
}
export type SearchCompanyType=CompanyType|"any"
export type SearchCompanyPageRole="ok"|"cancel"

