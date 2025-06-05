import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { response } from 'express';
import { SharedVarService } from 'src/app/services/sharedVar.service';
// import { CookiesService } from '@ngx-utils/cookies';
import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { ControlMessagesComponent } from 'src/app/shared/control-messages/control-messages.component';
import { CommonLeftportionComponent } from '../common-leftportion/common-leftportion.component';

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss'],
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule, CommonModule, PipesModule, TranslateModule, ControlMessagesComponent, CommonLeftportionComponent]
})
export class EmailVerifyComponent implements OnInit {
  commonConfigFlow: any;
  verifiedSteps: any;
  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    public global: GlobalService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private dashboardService: DashboardService,
    private sharedVarService: SharedVarService,
    private cookieService: CookieService,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.dashboardService.getStepsInfo().subscribe((res) => {
      if (res.success) {
        this.sharedVarService.setStepsInfo(res.result);
        this.verifiedSteps = res.result;
      }
    });
    await this.setConfigFlow();
    setTimeout(async () => {
      await this.checkToken();
    }, 1000);

  }

  checkToken() {
    const emailToken = this.route.snapshot.params['emailToken'];
    if (emailToken) {
      this.authenticationService.commonEmailVerification(emailToken).subscribe((res: any) => {
        if (res.success) {
          if (res?.message) {
            this.global.successToastr(res?.message);
          }
          if (res?.result?.token) {
            // this.cookieService.set('user_auth_token', res.result.token,);
            this.global.setCookieAuthUserToken(res.result.token);
          }
          if (res?.result?.config_info) {
            this.getCheckConfigInfo(res?.result?.config_info, res);
          }
        } else {
          if (this.verifiedSteps) {
            if (this.global.checkForMFAPP(this.verifiedSteps)) {
              this.global.redirectToLastVerifiedPage(this.verifiedSteps);
            } else {
              this.global.redirectToLastVerifiedPageGold(this.verifiedSteps);
            }
          } else {
            this.router.navigate(['/']);
          }
          if (res?.message) {
            this.global.errorToastr(res.message);
          }
        }
      }, (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.global.errorToastr(this.translate.instant('Please_try_again'));
          if (this.verifiedSteps) {
            if (this.global.checkForMFAPP(this.verifiedSteps)) {
              this.global.redirectToLastVerifiedPage(this.verifiedSteps);
            } else {
              this.global.redirectToLastVerifiedPageGold(this.verifiedSteps);
            }
          } else {
            this.router.navigate(['/']);
          }
        }
      });
    }
  }

  /**
   * Set Config Flow into shared variable
   */
  setConfigFlow() {
    const obj = { 'login_type': environment.login_type }; // login_type =  Mobile_OTP  || Email_Password || Pan_DOB
    this.global.getConfigureFlow(obj).subscribe((res: any) => {
      if (res.success) {
        this.sharedVarService.setConfigFlowData(res.result);
        this.commonConfigFlow = res.result;
      } else {
        const obj = {
          'login_type': environment.login_type,
          'step1': 'mobile',
          'step2': 'otp',
          'step3': 'email',
          'step4': 'pan_dob'
        }
        this.sharedVarService.setConfigFlowData(obj);
      }
    }, error => {
      const obj = {
        'login_type': environment.login_type,
        'step1': 'mobile',
        'step2': 'otp',
        'step3': 'email',
        'step4': 'pan_dob'
      }
      this.sharedVarService.setConfigFlowData(obj);
    });
  }

  /**
   * Get check config info of steps
   */
  getCheckConfigInfo(config_info: any, res: any) {
    this.sharedVarService.setConfigStepData(config_info);
    if (!config_info.step_2) {
      if (this.commonConfigFlow.step2 === 'email') {
        this.router.navigate(['register-email']);
      } else if (this.commonConfigFlow.step2 === 'pan_dob') {
        this.router.navigate(['register-pan-dob']);
      } else if (this.commonConfigFlow.step2 === 'mobile') {
        if (config_info?.mobile) {
          this.cookieService.set('user_mobile', config_info.mobile, this.global.getCookieExpiredTime());
        }
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
        if (config_info?.mobile) {
          this.cookieService.set('user_mobile', config_info.mobile, this.global.getCookieExpiredTime());
        }
        this.router.navigate(['register-mobile-number']);
      } else if (this.commonConfigFlow.step3 === 'otp') {
        if (config_info?.mobile) {
          this.cookieService.set('user_mobile', config_info.mobile, this.global.getCookieExpiredTime());
        }
        this.router.navigate(['register-mobile-number']);
      } else {
        this.router.navigate(['welcome']);
      }
    } else if (!config_info.step_4) {
      if (this.commonConfigFlow.step4 === 'email') {
        this.router.navigate(['register-email']);
      } else if (this.commonConfigFlow.step4 === 'pan_dob') {
        this.router.navigate(['register-pan-dob']);
      } else if (this.commonConfigFlow.step4 === 'mobile') {
        if (config_info?.mobile) {
          this.cookieService.set('user_mobile', config_info.mobile, this.global.getCookieExpiredTime());
        }
        this.router.navigate(['register-mobile-number']);
      } else if (this.commonConfigFlow.step4 === 'otp') {
        if (config_info?.mobile) {
          this.cookieService.set('user_mobile', config_info.mobile, this.global.getCookieExpiredTime());
        }
        this.router.navigate(['register-mobile-number']);
      } else {
        this.router.navigate(['welcome']);
      }
    } else {
      if (res) {
        let userD: any = {};
        if (res?.result?.appId) {
          userD['appId'] = res?.result?.appId;
        }
        if (res?.result?.panUserName) {
          userD['panUserName'] = res?.result?.panUserName;
        }
        this.cookieService.set('user', JSON.stringify(userD));
        this.sharedVarService.setLoggedUserInfoValue(userD);

        if (res?.result?.stepInfo) {
          if (res?.result?.stepInfo?.egoldkyccomplete) {
            const GolpAppToken = res?.result?.token;
            const redirectUrl = `${environment.golapp}/loginWithToken/${GolpAppToken}`;
            window.location.href = redirectUrl;
          } else {
            this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
            if (res?.result?.stepInfo?.isEKYCComplete === 1) {
              this.router.navigate(['thank-you']);
            } else {
              if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
                this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
              } else {
                this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
              }
            }
          }
        } else {
          this.router.navigate(['welcome']);
        }
      } else {
        this.router.navigate(['welcome']);
      }
    }
  }

}
