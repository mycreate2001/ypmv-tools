import { Pipe, PipeTransform } from '@angular/core';
import { BasicDataType } from 'src/app/models/basic.model';
import { statusList, ToolStatus } from 'src/app/models/tools.model';
const _NOT_CHECK=1
@Pipe({
  name: 'status',
  pure:false,
  
})
export class StatusPipe implements PipeTransform {

  transform(stt: ToolStatus,type:BasicDataType='tool'): 'Not Check'|'OK'|'NG' {
    // const PRG='status pipe'
    // console.log("[%s] input",PRG,{stt,type})
    const keys=statusList[type]
    const notCheck:boolean=keys.some(key=>stt[key]==_NOT_CHECK)
    if(notCheck) return 'Not Check'
    const value:number=keys.reduce((acc,curr)=>acc+stt[curr],0)
    return value?'NG':'OK'
  }

}
