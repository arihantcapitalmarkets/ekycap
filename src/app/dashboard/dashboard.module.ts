import { NgModule } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../services/auth.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
  declarations: [
  ],
  imports: [
    DashboardRoutingModule,
    NgxMaskPipe,
    NgxMaskDirective,
  ],
  providers: [
    DashboardService, AuthService, AuthenticationService, NgbActiveModal, provideNgxMask()
  ]
})
export class DashboardModule { }
