import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EsignComponent } from './esign/esign.component';
import { eSignResolver } from './shared/esign.resolver';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'esign/:token',
        component: EsignComponent,
        data: { title: 'Complete E-sign' },
        resolve: { esignData: eSignResolver }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EsignFlowRoutingModule { }
