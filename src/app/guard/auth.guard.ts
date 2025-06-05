import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { Location } from "@angular/common";
import { GlobalService } from "../services/global.service";
import { AuthService } from '../services/auth.service';
import { SharedVarService } from '../services/sharedVar.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { DashboardService } from '../dashboard/dashboard.service';
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie-service";
// import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  userLogin: any;
  userStepInfo: any;
  constructor(
    private router: Router,
    // private jwtHelper: JwtHelperService,
    public global: GlobalService,
    private location: Location,
    private cookieService: CookieService,
    public auth: AuthService,
    private sharedVarService: SharedVarService,
    private dashboardService: DashboardService,
    private translate: TranslateService
  ) { }
  /* = checks weather user can access route path or not
  ---------------------------------------------------- */
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // console.log('auth-gard-checking');
    const token = this.cookieService.get('user_auth_token');
    if (token) {
      this.auth.loggedIn = true;
      this.sharedVarService.setValue(true);
      if (!this.auth.currentUser) {
        if (this.cookieService.get('user')) {
          this.auth.setCurrentUser(JSON.parse(this.cookieService.get('user')));
        } else {
          await this.auth.getUserDetails(token);
        }
        return true;
      } else {
        return true;
      }
    } else {
      this.deleteAllData();
      // this.global.errorToastr(this.translate.instant('Authorization_expired'));
      this.redirectToSignIn();
      return false;
    }
  }

  // CHECK FOR AUTHORIZATION (ACCORDING TO ROLE)
  async canActivateChild(route: ActivatedRouteSnapshot) {
    const userToken: any = this.cookieService.get('user_auth_token');
    if (!userToken) {
      this.deleteAllData();
      this.redirectToSignIn();
      return false;
    }
    // else {
    //   await this.getStepInfo();
    //   console.log('test');
    // }
    return true;
  }

  redirectToSignIn() {
    this.cookieService.delete('user');
    this.router.navigate(['/']);
  }

  /**
   * Delete all storage data
   */
  deleteAllData() {
    this.global.clearLocalStorage();
    this.global.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'app_id']);
    this.auth.loggedIn = false;
    this.sharedVarService.setValue(false);
    this.sharedVarService.setLoggedUserInfoValue('');
    this.global.errorToastr(this.translate.instant('Authorization_failed'));
  }

  deleteTokenAndRedirectToLogin() {
    this.global.clearLocalStorage();
    this.global.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'app_id']);
    this.auth.loggedIn = false;
    this.sharedVarService.setValue(false);
    this.sharedVarService.setLoggedUserInfoValue('');
    this.cookieService.delete('user');
    let rmcode = '';
    if (window.localStorage.getItem('rmcode')) {
      rmcode = window.localStorage.getItem('rmcode');
    }
    if (rmcode) {
      this.router.navigate([`/`], { queryParams: { 'rmcode': rmcode } });
    } else {
      this.router.navigate([`/`]);
    }
  }

}

