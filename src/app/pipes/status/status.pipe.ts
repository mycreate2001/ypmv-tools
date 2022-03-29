import { Pipe, PipeTransform } from '@angular/core';
import { ToolStatus } from 'src/app/models/tools.model';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  transform(stt: ToolStatus): string {

    const result= Object.keys(stt).every(key=>stt[key]==0)?"OK":"NG"
    console.log("status pipe:",{stt,result});
    return result
  }

}
