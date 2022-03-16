import { createOpts } from "../utils/minitools";
import { ToolData } from "./tools.model";
export declare type ApprovedResultType="Not yet"|"Accept"|"Reject"
export declare type BookingInforStatusType="Created"|"Approved"|"Renting"|"Returned"
export interface BookingInfor{
    /** create */
    id:string;
    createDate:string;              // create date
    createBy:string;                // create by user
    userId:string;
    scheduleStart:string;           // start date in schedule
    scheduleFinish:string;          // finish data in schedule
    scheduleTools:ToolStatus[];         // renting tools in schedule
    companyId:string;               // renting company
    purpose:string;                 // purpose of renting tool

    /** approved*/
    approvedBy:string;                      // who approved
    approvedDate:string;                    // approved date
    approvedResult:ApprovedResultType;      // approved or reject
    approvedComment:string;                 // comment

    /** check before renting */
    checkingDate:string;         // actual start date
    checkingTools:ToolStatus[];       // actual tools status
    checkingManId:string;        // actual yamaha PIC
    checkingAgencyId?:string;      // Agency main
    checkingAgencyName:string;     // Name of agency man who take the tool
    checkingComment:string;       // checking comment, ex: tool a have problem,...

    /** return tools */
    returnDate:string;
    returnTools:ToolStatus[];   // tool & status
    returnManId:string;         // Yamaha get the tools
    returnAgencyId?:string;     // agency man who return tools/jigs
    returnAgencyName:string;    //

    /** storage at YPMV */
    paringTools:ParingData[];   //
    status:BookingInforStatusType;
}

export interface BookingInforOpts{
    /** create */
    id?:string;
    createDate?:string;              // create date
    createBy?:string;                // create by user
    userId:string;
    scheduleStart?:string;           // start date in schedule
    scheduleFinish?:string;          // finish data in schedule
    scheduleTools?:ToolStatus[];         // renting tools in schedule
    companyId?:string;               // renting company
    purpose?:string;                 // purpose of renting tool

    /** approved*/
    approvedBy?:string;                      // who approved
    approvedDate?:string;                    // approved date
    approvedResult?:ApprovedResultType;      // approved or reject
    approvedComment?:string;                 // comment

    /** check before renting */
    checkingDate?:string;         // actual start date
    checkingTools?:ToolStatus[];       // actual tools status
    checkingManId?:string;        // actual yamaha PIC
    checkingAgencyId?:string;      // Agency main
    checkingAgencyName?:string;     // Name of agency man who take the tool
    checkingComment?:string;       // checking comment, ex?: tool a have problem,...

    /** return tools */
    returnDate?:string;
    returnTools?:ToolStatus[];   // tool & status
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
    const createDate:string=now.toISOString();
    const df:BookingInfor={
        id,
        createDate,
        createBy:'',
        userId:'',
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
        status:"Created"
    }
    return createOpts(df,opts) as BookingInfor
}

export interface ToolStatus{
    toolId:string;      // tool ID
    coverId:string;     // set Id
    group:string;       // category
    name:string;        //  name of tool or set
    visual:number;          // status of visual
    operation:number;       // operation status
    function:number;        // function status
    compQty:number;         // status of component quantity
    images:ImageData[];           // Image
}

export interface ToolStatusOpts{
    toolId?:string;      // tool ID
    coverId?:string;     // set Id
    group?:string;       // category
    name?:string;        //  name of tool or set
    visual?:number;          // status of visual
    operation?:number;       // operation status
    function?:number;        // function status
    compQty?:number;         // status of component quantity
    images?:ImageData[];           // Image
}

export function createToolStatus(opts:ToolStatusOpts):ToolStatus{
    const df:ToolStatus={
        toolId:'',      // tool ID
        coverId:'',     // set Id
        group:'',       // category
        name:'',        //  name of tool or set
        visual:0,          // status of visual
        operation:0,       // operation status
        function:0,        // function status
        compQty:0,         // status of component quantity
        images:[]           // Image
    }
    return createOpts(df,opts) as ToolStatus
}


export interface ParingData{
    tools:string[];         // tool IDs
    coversId:string[];      // set Id
    parentsId:string;       // code of storage
    createAt:string;        // date of first scan
    userId:string;          // Yamaha guys who return tools/jigs into storage
}

export interface ImageData{
    url:string;
    caption:string;
}

