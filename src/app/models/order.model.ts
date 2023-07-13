import { createOpts } from "../utils/minitools";
import {  BasicData, createBasicData } from "./basic.model";
import { createSaveInf, SaveInfo } from "./save-infor.model";
// import { createToolStatus, ToolStatus } from "./tools.model";
import { UrlData } from "./util.model";
export declare type ApprovedResultType="Not yet"|"Accept"|"Reject"
export declare type OrderDataStatusType="new"|"created"|"approved"|"renting"|"returned"|"rejected"|"cancel"
export interface OrderData extends SaveInfo{
    /** create */
    // userId:string;
    // createAt:string;
    // comment:string;
    // lastUpdate:string;
    id:string;
    scheduleStart:string;           // start date in schedule
    scheduleFinish:string;          // finish data in schedule
    tools:BasicDataExt[];         // renting tools in schedule
    companyId:string;               // renting company
    purpose:string;                 // purpose of renting tool

    /** approved*/
    approvedBy:string;                      // who approved
    approvedDate:string;                    // approved date
    approvedResult:ApprovedResultType;      // approved or reject
    approvedComment:string;                 // comment

    /** check before renting */
    checkingTools:string;       // actual tools status
    checkingAgencyId?:string;      // Agency main
    checkingAgencyName:string;     // Name of agency man who take the tool
    rentDate:string;

    /** return tools */
    returnTools:string;   // tool & status
    returnAgencyId?:string;     // agency man who return tools/jigs
    returnAgencyName:string;    //

    /** storage at YPMV */
    status:OrderDataStatusType;
}

export type OrderDataOpts =Partial<OrderData>

export function createOrderData(opts?:OrderDataOpts):OrderData{
    const now=new Date();
    const id:string=now.getTime().toString(26);
    const df:OrderData={
        id,
        ...createSaveInf({createAt:now.toISOString()}),
        scheduleStart:'',           // start date in schedule
        scheduleFinish:'',          // finish data in schedule
        tools:[],                   // renting tools in schedule
        companyId:'',               // renting company
        purpose:'',                 // purpose of renting tool

        /** approved*/
        approvedBy:'',                      // who approved
        approvedDate:'',                    // approved date
        approvedResult:'Not yet',      // approved or reject
        approvedComment:'',                 // comment

        /** check before renting */
        checkingTools:'',       // actual tools status
        checkingAgencyId:'',      // Agency main
        checkingAgencyName:'',     // Name of agency man who take the tool
        rentDate:'',

        /** return tools */
        returnTools:'',   // tool & status
        returnAgencyId:'',     // agency man who return tools/jigs
        returnAgencyName:'',    //

        /** storage at YPMV */
        status:"new"
    }
    return createOpts(df,opts) as OrderData
}

export interface ParingData{
    tools:string[];         // tool IDs
    coversId:string[];      // set Id
    parentsId:string;       // code of storage
    createAt:string;        // date of first scan
    userId:string;          // Yamaha guys who return tools/jigs into storage
}

export interface BasicDataExt extends BasicData{   
    before:number;              // -1 not check, 0 = OK, 1~xxx = NG
    after:number;               // -1 not check, 0 = OK, 1~xxx = NG
    // haveImage:boolean;          // have images or not
    // haveComment:boolean;        // have comment
}

export function createBasicDataExt(opts:Partial<BasicDataExt>={}){
    const df:BasicDataExt={
        ...createBasicData({...opts}),
        // haveImage:false,
        // haveComment:false,
        before:1,
        after:1
    }
    return createOpts(df,opts);
}

////
export interface OrderDetail extends Omit<OrderData,"userId"|"approvedBy"|"companyId">{
    userId:DetailFromId;
    approvedBy:DetailFromId;
    companyId:DetailFromId;
}

export interface DetailFromId{
    id:string;
    name:string;
    image:string|UrlData;
}


/// const
export const _DB_ORDERS="orders"
export const _STORAGE_ORDERS="orders"

