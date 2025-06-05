import { NgModule, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Routes, RouterModule, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute, Router } from '@angular/router';
import { RouteGuard } from '../guard/route.guard';
import { AuthenticationService } from './authentication.service';
import { GlobalService } from '../services/global.service';
import { RegisterComponent } from './register/register.component';
import { MobileVerifyComponent } from './mobile-verify/mobile-verify.component';
import { EmailVerifyComponent } from './email-verify/email-verify.component';
import { RegisterEmailComponent } from './register-email/register-email.component';
import { RegisterPanDobComponent } from './register-pan-dob/register-pan-dob.component';
import { PhotoCaptureComponent } from './photo-capture/photo-capture.component';
import { DashboardService } from '../dashboard/dashboard.service';
import { SharedVarService } from '../services/sharedVar.service';
import { environment } from 'src/environments/environment';
// import { CookiesService } from '@ngx-utils/cookies';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map } from 'rxjs/operators';
import { AutologinComponent } from './autologin/autologin.component';
import { CookieService } from 'ngx-cookie-service';


@Injectable({ providedIn: 'root' })
export class verifyResolver implements Resolve<any> {
  constructor(
    private route: ActivatedRoute,
    private service: AuthenticationService,
    private router: Router,
    public global: GlobalService,
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return this.service.commonEmailVerification(route.paramMap.get('emailToken'));
  }
}

@Injectable({ providedIn: 'root' })
export class tokenVerifyResolver implements Resolve<any> {
  commonConfigFlow: any;
  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    private cookieService: CookieService,
    private translate: TranslateService,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {

    // return new Promise((resolve, reject) => {

    const params = route?.queryParams;
    if (params['token'] && params['byrmlogin']) {
      const deleteCookieArray = ['email', 'user_token', 'user_mobile', 'user_auth_token'];
      this.global.deleteMultiCookies(deleteCookieArray);
      // const obj = { 'login_type': environment.login_type };
      this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
        if (res) {
          this.commonConfigFlow = res;
        } else {
          this.global.setConfigFlow();
        }
      });
      // console.log('this.commonConfigFlow', this.commonConfigFlow);
      // console.log('params', params);
      const obj = { 'token': `${params['token']}` };
      return this.dashboardService.checkRMUserLoginTOKEN(obj).pipe(
        map((dataFromApi) => {
          // console.log('dataFromApi', dataFromApi);
          return dataFromApi
        })
        , catchError((error) => {
          const message = `Retrieval error: ${error}`;
          // console.error(message);
          return of({ product: null, error: message });
        })
      );

    } else if (params['token'] && params['bymsillogin']) {
      const deleteCookieArray = ['email', 'user_token', 'user_mobile', 'user_auth_token'];
      this.global.deleteMultiCookies(deleteCookieArray);
      // const obj = { 'login_type': environment.login_type };
      this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
        if (res) {
          this.commonConfigFlow = res;
        } else {
          this.global.setConfigFlow();
        }
      });
      // console.log('this.commonConfigFlow', this.commonConfigFlow);
      // console.log('params', params);
      const obj = { 'token': `${params['token']}` };
      return this.dashboardService.validateMsilToken(obj).pipe(
        map((dataFromApi) => {
          if (!dataFromApi?.success) {
            if (dataFromApi?.message) {
              this.global.errorToastr(dataFromApi?.message);
            }
            this.router.navigate(['/']);
            return false;
          }
          return dataFromApi
        })
        , catchError((error) => {
          const message = `Retrieval error: ${error}`;
          // console.error(message);
          return of({ product: null, error: message });
        })
      );

    } else {
      return false;
    }
  }
}




const routes: Routes = [
  {
    canActivate: [RouteGuard],
    path: '',
    component: RegisterComponent,
    data: {
      title: 'Register'
    }
  },
  {
    canActivate: [RouteGuard],
    path: 'register-email',
    component: RegisterEmailComponent,
    data: {
      title: 'Register Email'
    }
  },
  {
    canActivate: [RouteGuard],
    path: 'register-pan-dob',
    component: RegisterPanDobComponent,
    data: {
      title: 'Register PAN'
    }
  },
  {
    canActivate: [RouteGuard],
    path: 'mobile-verify',
    component: MobileVerifyComponent,
    data: {
      title: 'Mobile verification'
    }
  },
  {
    canActivate: [RouteGuard],
    path: 'email-verify/:emailToken',
    component: EmailVerifyComponent,
    data: {
      title: 'Email verification'
    }
  },
  {
    path: 'photograph/:token',
    component: PhotoCaptureComponent,
    data: {
      title: 'photo-capture'
    }
  },
  {
    path: 'autologin',
    component: AutologinComponent,
    data: {
      title: 'Login'
    },
    resolve: {
      prod: tokenVerifyResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }



