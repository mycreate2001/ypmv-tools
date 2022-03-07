import { digit } from "./minitools";

export function createLog(label:string){
   
    return function log(msg,...args){
        const stack=new Error('').stack.split("\n")[2];
        console.log("\n[%s] %s "+msg,timeStamp(),label,...args);
    }
}

function timeStamp(){
    const now=new Date();
    const date=[];
    const time=[];
    const delimiter_date="/"
    const delimiter_time=":"
    const delimitor_date_time=" "
    const mlist=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    date.push(now.getFullYear());
    date.push(mlist[now.getMonth()]);
    date.push(digit(now.getDate(),{texture:"0"}));
    time.push(now.getHours());
    time.push(now.getMinutes());
    time.push(now.getSeconds());
    time.push(now.getMilliseconds());
    return date.join(delimiter_date)+delimitor_date_time+time.join(delimiter_time)
}
