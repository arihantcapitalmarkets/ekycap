import { NgModule } from '@angular/core';
import { GetValueCheck, mobCharReplace, RestrictValues, SafeUrlPipe } from './mobCharReplace';
@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [
    mobCharReplace, SafeUrlPipe, RestrictValues, GetValueCheck
  ],
  exports: [
    mobCharReplace, SafeUrlPipe, RestrictValues, GetValueCheck
  ]
})
export class PipesModule { }