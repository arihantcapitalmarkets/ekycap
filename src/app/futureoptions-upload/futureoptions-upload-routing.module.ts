import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FutureoptionComponent } from './futureoption/futureoption.component';


const routes: Routes = [
  {
    path: 'future-option/:token',
    component: FutureoptionComponent,
    data: {
      title: 'Upload Proof'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FutureoptionsUploadRoutingModule { }
