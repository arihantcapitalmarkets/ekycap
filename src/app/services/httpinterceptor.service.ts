import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { GlobalService } from '../services/global.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, merge, fromEvent, Observer } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { isPlatformBrowser } from '@angular/common';
// import { map } from 'rxjs-compat/operator/map';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { AuthGuard } from '../guard/auth.guard';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class HttpinterceptorService implements HttpInterceptor {
  loader = false;
  isPlatformBrowser: boolean;
  loadingText: string = 'Loading... fetching';
  constructor(
    private router: Router,
    public global: GlobalService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private authGuard: AuthGuard,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platform: Object,
  ) {
    this.isPlatformBrowser = isPlatformBrowser(this.platform);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!req.params.has('hideLoader')) {
      this.loadingText = 'Pleaase wait...';
      this.spinner.show();
    }
    req.params.set('hideLoader', '');

    // req = req.clone({
    //   headers: req.headers.set('client_name', environment.client_name)
    //   // .set('header2', 'header 2 value')
    //   // .set('header3', 'header 3 value')
    // });

    let headerObj: any = { client_name: environment?.client_name };
    if (this.cookieService.get('user_token')) { // user register token
      const token = this.cookieService.get('user_token');
      headerObj['Authorization'] = token;
    }
    if (this.cookieService.get('user_auth_token')) { // user register token
      const token = this.cookieService.get('user_auth_token');
      headerObj['Authorization'] = token;
    }
    if (this.cookieService.get('login_user_token')) { // user login token
      const token = this.cookieService.get('login_user_token');
      headerObj['Authorization'] = token;
    }
    if (this.cookieService?.get('app_id')) { // user login token
      const appId = this.cookieService.get('app_id');
      headerObj['app_instance_id'] = appId;
    }
    req = req.clone({
      setHeaders: headerObj,
      // withCredentials: true,
    });
    // if (this.cookieService.get('user_token') || this.cookieService.get('user_auth_token') || this.cookieService.get('login_user_token')) {
    //   req = req.clone({
    //     setHeaders: headerObj
    //   });
    // }

    // if (this.cookieService.get('user_token')) { // user register token
    //   const token = this.cookieService.get('user_token');
    //   req = req.clone({
    //     setHeaders: {
    //       Authorization: token,
    //       client_name: environment.client_name
    //     }
    //   });
    // }
    // if (this.cookieService.get('user_auth_token')) { // user auth token
    //   const token = this.cookieService.get('user_auth_token');
    //   req = req.clone({
    //     setHeaders: {
    //       Authorization: token,
    //       client_name: environment.client_name
    //     }
    //   });
    // }
    // if (this.cookieService.get('login_user_token')) { // user login token
    //   const token = this.cookieService.get('login_user_token');
    //   req = req.clone({
    //     setHeaders: {
    //       Authorization: token,
    //       client_name: environment.client_name
    //     }
    //   });
    // }



    return next.handle(req).do(resp => {
      if (resp instanceof HttpResponse) {
        if (!resp.url.includes('hideLoader')) {
          this.onEnd();
          return resp;
        } else {
          return resp;
        }
      }
    }).catch(err => {
      // if (!resp.url.includes('hideLoader')) {
      //   this.onEnd();
      //   console.log('HIDE');
      // }
      this.onEnd();
      if (err instanceof HttpErrorResponse) {
        // console.log('err', err);
        switch (err.status) {
          case 401:
            if (err.error.message) {
              if (err?.error?.message !== "Unauthorized") {
                this.global.errorToastr(err.error.message);
              }
              if (err.error.message === "Unauthorized") {
                this.global.errorToastr("You are logged out because you are logged in from an another device.");
                this.authGuard.deleteTokenAndRedirectToLogin();
              }
            } else {
              this.global.errorToastr(err.error.error);
              this.handleAuthenticationError(err);
            }
            break;
          case 400:
            // console.log('error', err.error);
            if (err.status === 400 && err.error.message) {
              if (!err.error.success && err.error.message === 'Invalid token specified') {
                this.global.errorToastr(err.error.message);
                this.authGuard.deleteTokenAndRedirectToLogin();
              } else {
                this.global.errorToastr(err.error.message);
              }
            } else if (err.status === 400 && err.error.error == 'token_invalid') {
              this.global.errorToastr(err.error.error);
              this.handleAuthenticationError(err);
            } else if (err.status === 400 && err.error.error == 'token_not_provided') {
              this.global.errorToastr(this.translate.instant('sign_in_with_credentails'));
              this.router.navigate(['/']);
            } else if (err.status === 400 && err.error.status == 2) {
              this.toastr.warning(err.error.message, 'Error');
            } else if (err.status === 400 && err.error.status == 0) {
              this.global.errorToastr(err.error.message);
            } else if (err.error.error) {
              this.global.errorToastr(err.error.error);
            }
            break;
          case 404:
            if (err.status === 404 && err.error.error == 'user_not_found') {
              this.global.errorToastr(err.error.error);
            }
            break;
          case 422:
            if (err.status === 422 && err.error.error == 'invalid_credentials') {
              this.global.errorToastr(err.error.message);
            } else if (err.status === 422 && err.error.error == 'validation_failed') {
              this.global.errorToastr(this.translate.instant('something_went_wront_try_again'));
            }
            break;
          case 704:
            if (err.status === 704) {
              this.global.errorToastr(err.error.error);
            }
            break;

          default:
            if (err.statusText === 'Unknown Error') {
              this.createOnline$().subscribe((isOnline) => {
                if (!isOnline) {
                  this.global.errorToastr(this.translate.instant('Internet_disconnected'));
                } else {
                  this.global.errorToastr(this.translate.instant('something_went_wront_try_again'));
                }
              });
            } else {
              this.global.errorToastr(err.error.message);
            }
            break;
        }
      }
      return Observable.throw(err);
    });
  }

  handleAuthenticationError(error: any) {
    // const cinemacode = this.global.cinemaCode;
    this.auth.logout();
  }
  handleInternalServerError(error: any) { }

  commonError(error: any) {
    if (error && error.status && error.status !== 200) {
      return false;
    }
  }

  private onEnd(): void {
    this.spinner.hide();
  }

  createOnline$() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }
}
