import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { AuthenticationService } from './authentication.service';
import { AuthService } from '../services/auth.service';

import { AuthGuard } from '../guard/auth.guard';
import { RouteGuard } from '../guard/route.guard';
import { GlobalService } from '../services/global.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@NgModule({
  declarations: [],
  imports: [
    AuthenticationRoutingModule,
    NgxMaskPipe,
    NgxMaskDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    AuthGuard, RouteGuard, AuthenticationService, AuthService, GlobalService, provideNgxMask()
  ],
  exports: []
})
export class AuthenticationModule { }
