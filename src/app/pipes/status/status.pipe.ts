import { Pipe, PipeTransform } from '@angular/core';
import { StatusInf, _STATUS_NG, _STATUS_NOTYET, _STATUS_OK } from 'src/app/models/status-record.model';
// import { StatusInf, _STATUS_NG, _STATUS_NOTYET, _STATUS_OK } from '../models/status-record.model';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  transform(status:StatusInf[],type:'value'|'key'='key'): string|number {
    if(!status) return _STATUS_NOTYET[type]
    if(status.some(stt=>stt.value==_STATUS_NOTYET.value)) return _STATUS_NOTYET[type]
    return status.every(stt=>stt.value==_STATUS_OK.value)?_STATUS_OK[type]:_STATUS_NG[type]
  }

}

