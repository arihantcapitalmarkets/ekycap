import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NsdlTokenVerifyComponent } from './nsdl-token-verify/nsdl-token-verify.component';
import { eSignTokenResolver } from './shared/esign.resolver';
import { UnderReviewComponent } from './under-review/under-review.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'thank-you',
        component: UnderReviewComponent,
        data: { title: 'Thank You' },
      },
      {
        path: 'esign-token/token/:token',
        component: NsdlTokenVerifyComponent,
        data: { title: 'Complete E-sign' },
        resolve: { nsdlData: eSignTokenResolver }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EkycCompletedRoutingModule { }
