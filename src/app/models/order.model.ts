import { createOpts } from "../utils/minitools";
import {  BasicView, BasicViewOpts, createBasicData } from "./basic.model";
import { createSaveInf, SaveInfo } from "./save-infor.model";
import { createToolStatus, ToolStatus } from "./tools.model";
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
    tools:CheckData[];         // renting tools in schedule
    companyId:string;               // renting company
    purpose:string;                 // purpose of renting tool

    /** approved*/
    approvedBy:string;                      // who approved
    approvedDate:string;                    // approved date
    approvedResult:ApprovedResultType;      // approved or reject
    approvedComment:string;                 // comment

    /** check before renting */
    checkingDate:string;         // actual start date
    checkingTools:CheckData[];       // actual tools status
    checkingManId:string;        // actual yamaha PIC
    checkingAgencyId?:string;      // Agency main
    checkingAgencyName:string;     // Name of agency man who take the tool
    checkingComment:string;       // checking comment, ex: tool a have problem,...

    /** return tools */
    returnDate:string;
    returnTools:CheckData[];   // tool & status
    returnManId:string;         // Yamaha get the tools
    returnAgencyId?:string;     // agency man who return tools/jigs
    returnAgencyName:string;    //

    /** storage at YPMV */
    paringTools:ParingData[];   //
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
        checkingDate:'',         // actual start date
        checkingTools:[],       // actual tools status
        checkingManId:'',        // actual yamaha PIC
        checkingAgencyId:'',      // Agency main
        checkingAgencyName:'',     // Name of agency man who take the tool
        checkingComment:'',       // checking comment, ex?: tool a have problem,...

        /** return tools */
        returnDate:'',
        returnTools:[],   // tool & status
        returnManId:'',         // Yamaha get the tools
        returnAgencyId:'',     // agency man who return tools/jigs
        returnAgencyName:'',    //

        /** storage at YPMV */
        paringTools:[],   //
        status:"new"
    }
    return createOpts(df,opts) as OrderData
}

export interface CheckData extends BasicView {
    /** status of tool/jig before renting */
    beforeStatus:ToolStatus;       
    /** images of tool/jig before rentig */
    beforeImages:UrlData[];       
    /** person who check before renting tool/jig */
    beforeUserId:string;            
    /** status of tool/jig after return */
    afterStatus:ToolStatus;         
    /** image of tool/jig after return  */
    afterImages:UrlData[];          
    /** user who checking after tool come back */
    afterUserId:string;
    
}


export interface CheckDataOpts extends BasicViewOpts {
    /** status of tool/jig before renting */
    beforeStatus?:ToolStatus;      
    /** images of tool/jig before rentig */
    beforeImages?:UrlData[];        
    /** person who check before renting tool/jig */
    beforeUserId?:string;        
    /** status of tool/jig after return */
    afterStatus?:ToolStatus;       
    /** image of tool/jig after return  */
    afterImages?:UrlData[];        
    /** user who checking after tool come back */
    afterUserId?:string;
    
}

export function createCheckData(opts:CheckDataOpts){
    const now=new Date();

    const df:CheckData={
        ...createBasicData(),
        beforeImages:[],
        beforeStatus:createToolStatus(),
        beforeUserId:'',
        afterImages:[],
        afterStatus:createToolStatus(),
        afterUserId:'',
        childrenId:[]
    }
    return createOpts(df,opts)
}


export interface ParingData{
    tools:string[];         // tool IDs
    coversId:string[];      // set Id
    parentsId:string;       // code of storage
    createAt:string;        // date of first scan
    userId:string;          // Yamaha guys who return tools/jigs into storage
}


/// const
export const _DB_ORDERS="bookInfors"
export const _STORAGE_ORDERS="bookInfors"

