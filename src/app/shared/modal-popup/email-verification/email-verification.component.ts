import { Router } from '@angular/router';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { GlobalService } from 'src/app/services/global.service';
// import { CookiesService } from '@ngx-utils/cookies';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  standalone: true,
  imports: [TranslateModule]
})
export class EmailVerificationComponent implements OnInit {
  @Input() objectOfModal: any;

  listOfReasons: any[] = [];
  getReasonArray: FormArray;
  reasonDetailsform: FormGroup;
  selectedReasonsArray: any[];
  favReasonsError: boolean = true;
  commonConfigFlow: any;
  constructor(
    private router: Router,
    public fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private activeModal: NgbActiveModal,
    public global: GlobalService,
    private dashboardService: DashboardService,
    private sharedVarService: SharedVarService,
    private cookieService: CookieService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      } else {
        this.global.setConfigFlow();
      }
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    this.activeModal.close(true);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  /**
   * verify email before submit ekyc
   */
  resendVerifyEmail() {
    this.dashboardService.resendEmail().subscribe((res: any) => {
      if (res.success) {
        this.accept();
      } else {
        this.dismiss();
      }
    }, error => {
      this.dismiss();
    })
  }

  checkEmailVerified() {
    this.global.configInfo().subscribe((res: any) => {
      if (res.success) {
        if (res?.result?.config_info && res?.result?.config_info?.isEmailVerified) {
          this.getCheckConfigInfo(res?.result?.config_info);
        } else {
          this.global.errorToastr(this.translate.instant('VERIFY_EMAIL'))
          this.dismiss();
        }
      } else {
        this.dismiss();
      }
    }, error => {
      this.dismiss();
    });
  }

  /**
   * Get check config info of steps
   */
  getCheckConfigInfo(config_info: any) {
    this.sharedVarService.setConfigStepData(config_info);
    this.accept();
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
        this.global.generateToken().subscribe(async (res: any) => {
          if (res.success) {
            let userD: any = {};
            if (res?.result?.appId) {
              userD['appId'] = res?.result?.appId;
            }
            if (res?.result?.panUserName) {
              userD['panUserName'] = res?.result?.panUserName;
            }
            this.cookieService.set('user', JSON.stringify(userD));
            this.sharedVarService.setLoggedUserInfoValue(userD);

            // this.cookieService.set('user_auth_token', res.result.token, this.global.getCookieExpiredAuthTokenTime());
            this.global.setCookieAuthUserToken(res.result.token);
            if (res?.result?.stepInfo) {
              this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
              if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
                await this.global.verifyPanDetails();
              }
              if (res.result.stepInfo.isEKYCComplete === 1) {
                this.router.navigate(['thank-you']);
              } else {
                if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
                  this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
                } else {
                  this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
                }
              }
              return;
            }
            this.router.navigate(['welcome']);
          }
        });
      }
    } else {
      this.global.generateToken().subscribe(async (res: any) => {
        if (res.success) {
          let userD: any = {};
          if (res?.result?.appId) {
            userD['appId'] = res?.result?.appId;
          }
          if (res?.result?.panUserName) {
            userD['panUserName'] = res?.result?.panUserName;
          }
          this.cookieService.set('user', JSON.stringify(userD));
          this.sharedVarService.setLoggedUserInfoValue(userD);

          // this.cookieService.set('user_auth_token', res.result.token, this.global.getCookieExpiredAuthTokenTime());
          this.global.setCookieAuthUserToken(res.result.token);
          if (res?.result?.stepInfo) {
            this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
            if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
              await this.global.verifyPanDetails();
            }
            if (res.result.stepInfo.isEKYCComplete === 1) {
              this.router.navigate(['thank-you']);
            } else {
              if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
                this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
              } else {
                this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
              }
            }
            return;
          }
          this.router.navigate(['welcome']);
        }
      });
    }
  }



}
