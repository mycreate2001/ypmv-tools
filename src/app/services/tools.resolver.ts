import { Injectable } from "@angular/core";
import { ToolData, _DB_TOOLS } from "../models/tools.model";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { FirestoreService } from "./firebase/firestore.service-2";
import { Observable } from "rxjs";

@Injectable({providedIn:'root'})
export class ToolsResolver implements Resolve<ToolData[]>{
    constructor(private db:FirestoreService){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): ToolData[] | Observable<ToolData[]> | Promise<ToolData[]> {
        return this.db.search(_DB_TOOLS);
    }
}