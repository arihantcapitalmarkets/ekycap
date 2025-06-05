import { Injectable, NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules, Resolve, Router } from '@angular/router';
import { CommonLayoutComponent } from './layouts/common-layout/common-layout.component';
import { AuthGuard } from './guard/auth.guard';
import { ErrorComponent } from './static-pages/error/error.component';
import { CustomPreloadingStrategyService } from './services/custom-preloading-strategy.service';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication/authentication.service';
// import { CookiesService } from '@ngx-utils/cookies';
import { GlobalService } from './services/global.service';
import { AuthService } from './services/auth.service';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class redirectResolver implements Resolve<any> {
  constructor(
    private authenticationService: AuthenticationService,
    private cookie: CookieService,
    private global: GlobalService,
    private router: Router,
    private auth: AuthService
  ) { }

  resolve(): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('ref_token') && environment.isRefreshTokenCheck) {
        // console.log('localstorage', localStorage.getItem('ref_token'));
        let obj = {}
        obj['refreshToken'] = JSON.parse(localStorage.getItem('ref_token'));
        // console.log('test for on load resolver', obj);
        // // Set interval to call API every 15 minutes (900000 milliseconds)
        this.authenticationService.regenerateAccessToken(obj, true)
          .subscribe(
            data => {
              if (data?.result?.token) {
                this.cookie.set('user_auth_token', data?.result?.token);
                this.authenticationService.setAccessTokenExpiry();
                resolve(true);
              } else {
                this.global.clearLocalStorage();
                this.global.errorToastr('Authentication Time OUT, Please login again to continue...');
                this.auth.logoutWithoutSession();
                // this.router.navigate(['/']);
                resolve(true);
              }
            },
            error => {
              // Handle error here
              // console.error(error?.status);
              // console.error(error);
              if (error && error?.status === 400) {
                this.global.clearLocalStorage();
                this.auth.logoutWithoutSession();
              }
              resolve(true);
            }
          );
      } else {
        resolve(true);
      }
    });
    // const returnData = this.dashboardService.getStepsInfo();
    // return returnData;
  }
}

const routes: Routes = [
  {
    path: '', component: CommonLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule),
      },
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () => import('./ekyc-completed/ekyc-completed.module').then(m => m.EkycCompletedModule),
      },
      {
        path: '',
        loadChildren: () => import('./esign-flow/esign-flow.module').then(m => m.EsignFlowModule),
      },
      {
        path: '',
        loadChildren: () => import('./futureoptions-upload/futureoptions-upload.module').then(m => m.FutureoptionsUploadModule),
      },
      {
        path: '',
        loadChildren: () => import('./bot-autologin/bot-autologin.module').then(m => m.BotAutologinModule),
      },
      {
        path: '',
        loadChildren: () => import('./pages/terms-condition/terms-condition.module').then(m => m.TermsConditionModule),
      },
      {
        path: 'error',
        component: ErrorComponent,
        data: { title: 'Error' }
      },
      { path: '', redirectTo: '/', pathMatch: 'full' }
    ],
    // resolve: {
    //   getStepData: redirectResolver
    // },
  },
  { path: '**', redirectTo: 'error' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // preloadingStrategy: CustomPreloadingStrategyService,
    // preloadingStrategy: PreloadAllModules,
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
