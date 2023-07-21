import { Injectable } from "@angular/core";
import { ModelData, _DB_MODELS } from "../interfaces/tools.model";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { FirestoreService } from "./firebase/firestore.service-2";
import { Observable } from "rxjs";

@Injectable({providedIn:'root'})
export class ModelsResolver implements Resolve<ModelData[]>{
    constructor(private db:FirestoreService){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): ModelData[] | Observable<ModelData[]> | Promise<ModelData[]> {
        return this.db.search(_DB_MODELS);
    }
}