import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import 'rxjs/add/operator/map';
import { BehaviorSubject, Observable } from 'rxjs';
import { SharedVarService } from './sharedVar.service';
import { GlobalService } from './global.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
declare let ue: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn = false;
  currentUser = '';
  userData: any = [];

  constructor(
    private router: Router,
    private cookies: CookieService,
    private authenticationService: AuthenticationService,
    private sharedVarService: SharedVarService,
    public global: GlobalService,
    private translate: TranslateService
  ) {
    // this.isTokenExpired();
  }

  // Check token valid or not
  async isTokenExpired() {
    const token = this.cookies.get('user_auth_token');
    if (token) {
      this.loggedIn = true;
      this.sharedVarService.setValue(true);
      if (!this.currentUser) {
        // console.log('No No');
        await this.getUserDetails(token);
      } else {
        // console.log('Yes Yeah');
      }
    }
  }

  /**
   * Logout user and cleat storage
   */
  logout() {
    if (environment.logoutApi) {
      this.global.removeLogoutApi().subscribe((res: any) => {
        if (res?.success) {
          if (environment.userExperior && this.global.globalUserExperiorSet) {
            ue.unsetUserIdentifier()
          }
          this.global.clearLocalStorage();
          this.global.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'mfapp', 'app_id', 'accessTokenExp']);
          this.loggedIn = false;
          this.sharedVarService.setValue(false);
          this.sharedVarService.setLoggedUserInfoValue('');
          //   this.sharedVarService.setStepsInfo('');
          this.global.successToastr(this.translate.instant('logout_message'), 'Goodbye!');
          let rmcode = '';
          if (window.localStorage.getItem('rmcode')) {
            rmcode = window.localStorage.getItem('rmcode');
          }
          if (rmcode) {
            this.router.navigate([`/`], { queryParams: { 'rmcode': rmcode } });
          } else {
            this.router.navigate([`/`]);
          }
        } else {
          if (environment.userExperior && this.global.globalUserExperiorSet) {
            ue.unsetUserIdentifier()
          }
          this.global.clearLocalStorage();
          this.global.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'mfapp', 'app_id', 'accessTokenExp']);
          this.loggedIn = false;
          this.sharedVarService.setValue(false);
          this.sharedVarService.setLoggedUserInfoValue('');
          //   this.sharedVarService.setStepsInfo('');
          this.global.successToastr(this.translate.instant('logout_message'), 'Goodbye!');
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
      }, error => {
        // this.global.errorToastr('Please try again...')
        if (environment.userExperior && this.global.globalUserExperiorSet) {
          ue.unsetUserIdentifier()
        }
        this.global.clearLocalStorage();
        this.global.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'mfapp', 'app_id', 'accessTokenExp']);
        this.loggedIn = false;
        this.sharedVarService.setValue(false);
        this.sharedVarService.setLoggedUserInfoValue('');
        //   this.sharedVarService.setStepsInfo('');
        this.global.successToastr(this.translate.instant('logout_message'), 'Goodbye!');
        let rmcode = '';
        if (window.localStorage.getItem('rmcode')) {
          rmcode = window.localStorage.getItem('rmcode');
        }
        if (rmcode) {
          this.router.navigate([`/`], { queryParams: { 'rmcode': rmcode } });
        } else {
          this.router.navigate([`/`]);
        }
      })

    } else {
      if (environment.userExperior && this.global.globalUserExperiorSet) {
        ue.unsetUserIdentifier()
      }
      this.global.clearLocalStorage();
      this.global.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'mfapp', 'accessTokenExp']);
      this.loggedIn = false;
      this.sharedVarService.setValue(false);
      this.sharedVarService.setLoggedUserInfoValue('');
      //   this.sharedVarService.setStepsInfo('');
      this.global.successToastr(this.translate.instant('logout_message'), 'Goodbye!');
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


  logoutWithoutSession() {
    let rmcode = '';
    if (this.cookies.get('rmcode')) {
      rmcode = this.cookies.get('rmcode');
    }
    this.sharedVarService.getStepsInfo().subscribe((result) => {
      if (result?.rmCode) {
        rmcode = result?.rmCode;
      }
    });
    if (environment.userExperior && this.global.globalUserExperiorSet) {
      ue.unsetUserIdentifier();
    }
    this.global.clearLocalStorage();
    this.global.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'mfapp', 'accessTokenExp']);
    this.loggedIn = false;
    this.sharedVarService.setValue(false);
    this.sharedVarService.setLoggedUserInfoValue('');
    //   this.sharedVarService.setStepsInfo('');
    // this.global.successToastr(this.translate.instant('logout_message'), 'Goodbye!');

    if (rmcode) {
      window.location.href = `${environment.logoutRedirectUrl}?rmcode=${rmcode}`;
      // this.router.navigate([`${environment.logoutRedirectUrl}`], { queryParams: { rmcode: rmcode } });
      // this.router.navigateByUrl ([`${environment.logoutRedirectUrl}`], { queryParams: { 'rmcode': rmcode } });
    } else {
      this.router.navigate([`/`]);
    }
  }

  // decode token
  decodeUserFromToken(token) {
    // return this.jwtHelper.decodeToken(token);
  }

  setCurrentUser(decodedUser) {
    this.loggedIn = true;
    this.currentUser = decodedUser;
    this.sharedVarService.setLoggedUserInfoValue(decodedUser);
  }

  /**
   * Get logged in User details
   */
  getUserDetails(user_auth_token) {
    return this.authenticationService.getUserDetails().subscribe(
      (res: any) => {
        if (!res.result) {
          this.loggedIn = false;
          this.sharedVarService.setValue(false);
          this.cookies.delete('user');
          return res;
        } else {
          this.setCurrentUser(res.result);
          this.sharedVarService.setValue(true);
          this.loggedIn = true;
          const userD: any = { 'appId': res?.result?.appId, 'panUserName': res?.result?.panUserName };
          this.cookies.set('user', JSON.stringify(userD));
          return res;
        }
      }
    );
  }

  /**
   * Login service
   */
  verifyLoginOtp(credentails: any) {
    return this.authenticationService.verifyLoginOtp(credentails).map(
      (res: any) => {
        if (!res.success) {
          this.loggedIn = false;
          this.sharedVarService.setValue(false);
          this.cookies.delete('user');
          return false;
        } else {
          this.setCurrentUser(res.result);
          this.sharedVarService.setValue(true);
          this.loggedIn = true;
          const userD: any = { 'appId': res.result.appId, 'panUserName': res.result.panUserName };
          this.cookies.set('user', JSON.stringify(userD));
          return res;
        }
      }
    );
  }

  /**
   * Auto Register service and verify otp
   */
  verifyOtp(credentails: any) {
    return this.authenticationService.verifyOtp(credentails).map(
      (res: any) => {
        if (!res.result) {
          this.sharedVarService.setValue(false);
          this.loggedIn = false;
          this.cookies.delete('user');
          return false;
        } else {
          this.setCurrentUser(res.result);
          this.sharedVarService.setValue(true);
          this.loggedIn = true;
          const userD: any = { 'appId': res.result.appId, 'panUserName': res.result.panUserName };
          this.cookies.set('user', JSON.stringify(userD));
          return res;
        }
      }
    );
  }

  /**
   * Resend otp to mobile number
   * @param login_token 
   */
  resendOtp(mobileNumber: any) {
    return this.authenticationService.resendOtp().subscribe((res: any) => {
      if (res.success) {
        if (res.result.otpMaxTime) {
          let newDateObj: any = new Date();
          newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(res.result.otpMaxTime) * 1000)); // for 10 minute
          this.cookies.set('otpMaxTime', newDateObj, this.global.getCookieExpiredTime());
          this.global.successToastr(res.message);
        }
        this.authenticationService.timerOtp();
      } else {
        this.global.errorToastr(res.message);
      }
    });
  }

  /**
   * Resend otp to mobile number // new api as per dynamic flow
   * @param login_token 
   */
  resendOTP(mobileNumber: any) {
    const obj = { mobile_number: mobileNumber };
    return this.authenticationService.resendOTP(obj).subscribe((res: any) => {
      if (res.success) {
        if (res.result.otpMaxTime) {
          let newDateObj: any = new Date();
          newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(res.result.otpMaxTime) * 1000)); // for 10 minute
          this.cookies.set('otpMaxTime', newDateObj, this.global.getCookieExpiredTime());
          if (res?.message) {
            this.global.successToastr(res.message);
          }
          this.authenticationService.timerOtp();
        }
      } else {
        this.global.errorToastr(res.message);
      }
    });
  }

}
