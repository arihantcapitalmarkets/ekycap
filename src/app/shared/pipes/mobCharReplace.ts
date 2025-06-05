import { DomSanitizer } from '@angular/platform-browser';
import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { SharedVarService } from 'src/app/services/sharedVar.service';
@Pipe({
  name: 'mobCharReplace'
})
export class mobCharReplace implements PipeTransform {
  transform(input: any, fromIndex: any = 2, toIndex: any = 7, replaceString: any = 'X') {
    if (input) {
      var comingCharacter = input;
      const replaceStr = replaceString.repeat(6);
      // console.log('comingCharacter.substring(0, 2)', comingCharacter.substring(0, 2));
      comingCharacter = comingCharacter.substring(0, fromIndex) + replaceStr + comingCharacter.substring(8);
      return comingCharacter;
    }
  }
}


@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustResourceUrl(value);
  }
}



@Pipe({
  name: 'restrictValues'
})
// @Injectable()
export class RestrictValues implements PipeTransform {
  transform(items: any[], input: any): any {
    const result = items.filter(item => item.id === input);
    return result[0]?.name;
  }
}

@Pipe({
  name: 'getValueCheck'
})
@Injectable({
  providedIn: 'root'
})
export class GetValueCheck implements PipeTransform {
  transform(items: any[], input: any): any {
    const result = items.filter(item => item.id === input);
    return result[0]?.required;
  }
}

