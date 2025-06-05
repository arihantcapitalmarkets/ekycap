import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TermsConditionComponent } from './terms-condition.component';


const routes: Routes = [
  {
    path: 'terms-and-conditions/pmax',
    component: TermsConditionComponent,
    data: {
      title: 'Terms & Conditions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermsConditionRoutingModule { }
