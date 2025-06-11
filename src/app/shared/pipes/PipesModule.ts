import { NgModule } from '@angular/core';
import { GetLabel, GetValueCheck, mobCharReplace, RestrictValues, SafeUrlPipe } from './mobCharReplace';
@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [
    mobCharReplace, SafeUrlPipe, RestrictValues, GetValueCheck, GetLabel
  ],
  exports: [
    mobCharReplace, SafeUrlPipe, RestrictValues, GetValueCheck, GetLabel
  ]
})
export class PipesModule { }