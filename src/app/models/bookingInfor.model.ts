import { createOpts } from "../utils/minitools";
import { BasicData, BasicDataOpts, createBasicData } from "./basic.model";
import { createSaveInf, SaveInfo, SaveInfoOpts } from "./save-infor.model";
import { createToolStatus, ToolStatus, ToolStatusOpts } from "./tools.model";
export declare type ApprovedResultType="Not yet"|"Accept"|"Reject"
export declare type BookingInforStatusType="new"|"created"|"approved"|"renting"|"returned"|"rejected"
export interface BookingInfor extends SaveInfo{
    /** create */
    // userId:string;
    // createAt:string;
    // comment:string;
    // lastUpdate:string;
    id:string;
    scheduleStart:string;           // start date in schedule
    scheduleFinish:string;          // finish data in schedule
    scheduleTools:BasicData[];         // renting tools in schedule
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
    status:BookingInforStatusType;
}

export interface BookingInforOpts extends SaveInfoOpts{
    // userId:string;
    // createAt:string;
    // comment:string;
    // lastUpdate:string;
    /** create */
    id?:string;
    scheduleStart?:string;           // start date in schedule
    scheduleFinish?:string;          // finish data in schedule
    scheduleTools?:CheckData[];         // renting tools in schedule
    companyId?:string;               // renting company
    purpose?:string;                 // purpose of renting tool

    /** approved*/
    approvedBy?:string;                      // who approved
    approvedDate?:string;                    // approved date
    approvedResult?:ApprovedResultType;      // approved or reject
    approvedComment?:string;                 // comment

    /** check before renting */
    checkingDate?:string;         // actual start date
    checkingTools?:CheckData[];       // actual tools status
    checkingManId?:string;        // actual yamaha PIC
    checkingAgencyId?:string;      // Agency main
    checkingAgencyName?:string;     // Name of agency man who take the tool
    checkingComment?:string;       // checking comment, ex?: tool a have problem,...

    /** return tools */
    returnDate?:string;
    returnTools?:CheckData[];   // tool & status
    returnManId?:string;         // Yamaha get the tools
    returnAgencyId?:string;     // agency man who return tools/jigs
    returnAgencyName?:string;    //

    /** storage at YPMV */
    paringTools?:ParingData[];   //
    status?:BookingInforStatusType;
}

export function createBookingInfor(opts?:BookingInforOpts):BookingInfor{
    const now=new Date();
    const id:string=now.getTime().toString(36);
    const df:BookingInfor={
        id,
        ...createSaveInf({createAt:now.toISOString()}),
        scheduleStart:'',           // start date in schedule
        scheduleFinish:'',          // finish data in schedule
        scheduleTools:[],         // renting tools in schedule
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
    return createOpts(df,opts) as BookingInfor
}

export interface CheckData extends BasicData{
    status:ToolStatus
    image:string;//avatar
}

export interface CheckDataOpts extends BasicDataOpts{
    status?:ToolStatusOpts;
    image?:string;
}

export function createCheckData(opts:ToolStatusOpts):CheckData{
    const now=new Date();

    const df:CheckData={
        ...createBasicData(),
        image:'',
        status:createToolStatus()
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
export const _DB_INFORS="bookInfors"
export const _STORAGE_INFORS="bookInfors"

