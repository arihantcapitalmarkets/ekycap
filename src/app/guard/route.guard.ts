import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { AuthenticationService } from '../authentication/authentication.service';
import { GlobalService } from '../services/global.service';
import { HttpErrorResponse } from '@angular/common/http';
// import { CookiesService } from "@ngx-utils/cookies";
import { SharedVarService } from "../services/sharedVar.service";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: 'root' // just before your class
})
export class RouteGuard implements CanActivate { // without login not redirect to inner pages
  userLoginId: any;
  commonConfigFlow: any;
  constructor(private router: Router,
    private cookies: CookieService,
    private global: GlobalService,
    private authenticationService: AuthenticationService,
    private sharedVarService: SharedVarService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // const userData = JSON.parse(localStorage.getItem('userData'));
    const token = this.getCookie();

    const emailToken = route?.params?.emailToken;
    const currentRoute = route?.routeConfig?.path;
    // console.log('currentRoute', currentRoute);
    // console.log('currentRoute Match', currentRoute.match('register-email'));

    if (!token && currentRoute.match('register-email')) {
      // console.log("register-email screen");
      this.router.navigate(['/']);
      return true;
    } else if (!token && currentRoute.match('register-pan-dob')) {
      // console.log("register-pan-dob screen");
      this.router.navigate(['/']);
      return true;
    } else if (!token) {
      return true;
    }
    // currentRoute.match('register-email') || 


    if (currentRoute.match('mobile-verify') || currentRoute.match('register-mobile-number') || currentRoute.match('email-verify') || currentRoute.match('register-email') || currentRoute.match('register-pan-dob') || currentRoute.match('photograph')) {
      const token = this.getCookie();
      if (token) {
        // this.loggedIn = true;
        this.sharedVarService.setValue(true);
        if (currentRoute.match('register-email')) {
          this.sharedVarService.getConfigStepData().subscribe((res: any) => {
            if (res) {
              const stepInfo = res?.result?.stepInfo;
              const configInfo = res?.result?.config_info;
              this.checkEmailStepVerified(configInfo, stepInfo);
            } else {
              this.checkForEmailPanDOBStage('register-email');
            }
          })
        } else if (currentRoute.match('register-pan-dob')) {
          this.sharedVarService.getConfigStepData().subscribe((res: any) => {
            if (res) {
              const stepInfo = res?.result?.stepInfo;
              const configInfo = res?.result?.config_info;
              this.checkEmailStepVerified(configInfo, stepInfo);
            } else {
              this.checkForEmailPanDOBStage('register-pan-dob');
            }
          })
        }
      }
      if (!token) {
        await this.getSharedConfigFlow();
        await this.getAuthStepInfo();
        await this.getSiteContent();
        return false;
      }
      return true;
    }
    //  else if (!currentRoute) {
    //   const deleteCookieArray = ['user_auth_token', 'user_token'];
    //   this.global.deleteMultiCookies(deleteCookieArray);
    //   return true;
    // }
    // const userData: any = this.getDataLocally('userData');
    // if (!userData || !userData.token) {
    //   return true;
    // }
    await this.getSharedConfigFlow();
    await this.getAuthStepInfo();
    await this.getSiteContent();
    return false;
  }

  getCookie() {
    return this.cookies.get('user_auth_token');
  }

  checkForEmailPanDOBStage(forStep) {
    this.global.configInfo().subscribe((res: any) => {
      if (res.success) {
        const stepInfo = res?.result?.stepInfo;
        const configInfo = res?.result?.config_info;
        if (forStep === 'register-email') {
          this.checkEmailStepVerified(configInfo, stepInfo);
        } else if (forStep === 'register-pan-dob') {
          this.checkPANDOBStepVerified(configInfo, stepInfo);
        }
      } else {
        this.global.deleteMultiCookies(['user_token', 'user_mobile', 'otpMaxTime', 'user_auth_token']);
        this.router.navigate(['/']);
      }
    }, error => {
      this.global.deleteMultiCookies(['user_token', 'user_mobile', 'otpMaxTime', 'user_auth_token']);
      this.router.navigate(['/']);
    });
  }

  checkEmailStepVerified(configInfo: any, stepInfo: any) {
    if (configInfo?.step_3 && configInfo?.step_4) {
      if (stepInfo) {
        this.global.redirectToLastVerifiedPage(stepInfo);
      } else {
        this.router.navigate(['welcome']);
      }
    } else if (!configInfo?.step_3) {
      return true;
    } else if (!configInfo?.step_4) {
      this.router.navigate(['register-pan-dob']);
    }
  }

  checkPANDOBStepVerified(configInfo: any, stepInfo: any) {
    if (configInfo?.step_3 && configInfo?.step_4) {
      if (stepInfo) {
        this.global.redirectToLastVerifiedPage(stepInfo);
      } else {
        this.router.navigate(['welcome']);
      }
    } else if (!configInfo?.step_3) {
      this.router.navigate(['register-email']);
    } else if (!configInfo?.step_4) {
      return true;
    }
  }


  getSharedConfigFlow() {
    this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      } else {
        this.global.setConfigFlow();
      }
    });
  }

  getAuthStepInfo() {
    this.sharedVarService.getConfigStepData().subscribe((res: any) => {
      if (res) {
        this.getCheckConfigInfo(res);
      } else {
        this.getAuthStepInfoCheck();
      }
    });
  }

  getAuthStepInfoCheck() {
    this.global.configInfo().subscribe((res: any) => {
      if (res.success) {
        if (res?.result?.config_info) {
          this.sharedVarService.setConfigStepData(res?.result?.config_info);
          this.getCheckConfigInfo(res?.result?.config_info, res?.result?.stepInfo);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.global.deleteMultiCookies(['user_token', 'user_mobile', 'otpMaxTime', 'user_auth_token']);
        this.router.navigate(['/']);
      }
    }, error => {
      this.global.deleteMultiCookies(['user_token', 'user_mobile', 'otpMaxTime', 'user_auth_token']);
      this.router.navigate(['/']);
    });
  }

  /**
   * Get set up content
   */
  getSiteContent() {
    // const obj = { 'login_type': 'Mobile_OTP' };
    this.global.getSiteContent().subscribe((res: any) => {
      if (res.success) {
        this.sharedVarService.setSiteContentData(res.result);
      }
    }, error => {
    })
  }

  /**
   * Get check config info of steps
   */
  getCheckConfigInfo(config_info: any, stepInfo: any = '') {

    if (!config_info.step_2) {
      if (this.commonConfigFlow.step2 === 'email') {
        this.router.navigate(['register-email']);
      } else if (this.commonConfigFlow.step2 === 'pan_dob') {
        this.router.navigate(['register-pan-dob']);
      } else if (this.commonConfigFlow.step2 === 'mobile') {
        this.router.navigate(['register-mobile-number']);
      } else if (this.commonConfigFlow.step2 === 'otp') {
        this.router.navigate(['mobile-verify']);
      } else {
        this.router.navigate(['welcome']);
      }
    } else if (!config_info.step_3) {
      if (this.commonConfigFlow.step3 === 'email') {
        this.router.navigate(['register-email']);
      } else if (this.commonConfigFlow.step3 === 'pan_dob') {
        this.router.navigate(['register-pan-dob']);
      } else if (this.commonConfigFlow.step3 === 'mobile') {
        this.router.navigate(['register-mobile-number']);
      } else if (this.commonConfigFlow.step3 === 'otp') {
        this.router.navigate(['mobile-verify']);
      } else {
        this.router.navigate(['welcome']);
      }
    } else if (!config_info.step_4) {
      if (this.commonConfigFlow.step4 === 'email') {
        this.router.navigate(['register-email']);
      } else if (this.commonConfigFlow.step4 === 'pan_dob') {
        this.router.navigate(['register-pan-dob']);
      } else if (this.commonConfigFlow.step4 === 'mobile') {
        this.router.navigate(['register-mobile-number']);
      } else if (this.commonConfigFlow.step4 === 'otp') {
        this.router.navigate(['mobile-verify']);
      } else {
        this.router.navigate(['welcome']);
      }
    } else {
      if (stepInfo) {
        this.global.redirectToFirstUnVerifiedPage(stepInfo);
      } else {
        this.router.navigate(['welcome']);
      }
    }
  }


  getDataLocally(key: string) {
    const userData: any = localStorage.getItem(key);
    // const userData: any = this.cookies.get(key);
    return userData ? JSON.parse(userData) : '';
  }
}