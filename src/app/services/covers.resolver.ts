import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { FirestoreService } from "./firebase/firestore.service-2";
import { Observable } from "rxjs";
import { CoverData, _DB_COVERS } from "../models/cover.model";

@Injectable({providedIn:'root'})
export class CoversResolver implements Resolve<CoverData[]>{
    constructor(private db:FirestoreService){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): CoverData[] | Observable<CoverData[]> | Promise<CoverData[]> {
        return this.db.search(_DB_COVERS);
    }
}