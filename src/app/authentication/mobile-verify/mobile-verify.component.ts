import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, FormControl, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { AuthenticationService } from '../authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global.service';
import { AuthService } from 'src/app/services/auth.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { SharedModule } from "../../shared/shared.module";
import { CommonModule } from '@angular/common';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";
import { FooterComponent } from 'src/app/shared/footer/footer.component';
import { CommonLeftportionComponent } from '../common-leftportion/common-leftportion.component';
import { FaqComponent } from 'src/app/shared/faq/faq.component';
declare var $: any;
declare let fbq: any;
declare let ue: any;

@Component({
  selector: 'app-mobile-verify',
  templateUrl: './mobile-verify.component.html',
  styleUrls: ['./mobile-verify.component.scss'],
  standalone: true,
  imports: [SharedModule, CommonModule, ReactiveFormsModule, SharedModule, ControlMessagesComponent, TranslateModule]
})
export class MobileVerifyComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("myinput") myInputField: ElementRef;
  @ViewChild('mobileNumberSystemExist') mobileNumberSystemExist: any;
  public otpform: UntypedFormGroup;
  mobileNumber: any;
  timerOfOtp: any;
  timerShow: any;
  timeUp: boolean;
  public screenWidth: any;
  commonConfigFlow: any;
  contentData: any;
  mobileQueryParam: any;
  emailQueryParam: any;
  rmcode: any;
  referenceSourceQueryParam: any;
  isEncryptedQueryParam: any;
  loginInformationText: any;

  getParams: any;

  subscribeflowData: Subscription;
  subscribeContentData: Subscription;
  subscribeTimerValue: Subscription;
  subscribeTimerInfo: Subscription;
  isFromRmportal: boolean;
  byRmLogin: boolean;

  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public validate: ValidationService,
    private cookieService: CookieService,
    public authenticationService: AuthenticationService,
    public auth: AuthService,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService
  ) { }


  ngOnInit(): void {
    this.onResizeScreen();


    this.otpform = this.fb.group({
      otp: ['', Validators.compose([ValidationService.requiredOTPCustome, Validators.maxLength(6), ValidationService.mobileOtpValidator])]
    });

    this.subscribeflowData = this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      } else {
        this.global.setConfigFlow();
      }
    });
    // this.global.getConfigStepInfo();

    this.subscribeContentData = this.sharedVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.loginInformationText = data?.login_information_text;
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['rmcode']) {
        this.rmcode = params['rmcode'];
        // window.localStorage.setItem('rmcode', this.rmcode);
        this.cookieService.set('rmcode', this.rmcode, this.global.getCookieExpiredRMTime());
      }
      if (this.cookieService.get('rmcode')) {
        this.rmcode = this.cookieService.get('rmcode');
      }
      if (params['email']) {
        this.emailQueryParam = params['email'];
      }
      if (params['mobile']) {
        this.mobileQueryParam = params['mobile'];
        // this.mobileNumber = params['mobile'];
      }
      if (params['referencesource']) {
        this.referenceSourceQueryParam = params['referencesource'];
      }
      if (params['isencrypted']) {
        this.isEncryptedQueryParam = Number(params['isencrypted']);
      }
      if (params['params']) {
        this.getParams = params['params'];
      }
      if (params['fromrmportal']) {
        this.isFromRmportal = true;
      }
      if (params['byrmlogin']) {
        this.byRmLogin = true;
      }

      window.localStorage.setItem('mfapp', '0');
      if (params['mfapp'] === true || params['mfapp'] === 'true') {
        window.localStorage.setItem('mfapp', '1');
      }

    });

    if (this.getParams) { // while user come to the direct link using mobie and email query params
      setTimeout(() => {
        let paramObj: any = {};
        paramObj['login_type'] = environment.login_type;
        // if (this.rmcode) {
        //   paramObj['rmcode'] = this.rmcode;
        // }
        // if (this.referenceSourceQueryParam) {
        //   paramObj['referencesource'] = this.referenceSourceQueryParam;
        // }
        // if (this.isEncryptedQueryParam) {
        //   paramObj['isencrypted'] = this.isEncryptedQueryParam;
        // }
        if (environment.login_type === 'Mobile_OTP') {
          // paramObj['mobile_number'] = this.mobileQueryParam;
          // paramObj['email'] = this.emailQueryParam;
          paramObj['params'] = this.getParams;
          this.commonLoginApi(paramObj);
        }
      }, 1000);
    } else if (this.byRmLogin) {
      let pararmObj = {};
      this.route.queryParams.subscribe(params => {
        // pararmObj['mobilenumber'] = params['mobilenumber'];
        // pararmObj['byrmlogin'] = params['byrmlogin'];
        pararmObj['login_type'] = environment.login_type;
        pararmObj['params'] = params['token'];
        let dateObj: any = new Date();
        this.cookieService.delete('user_mobile');
        this.commonLoginApi(pararmObj);
      });
    } else if (this.cookieService.get('user_mobile')) {
      this.mobileNumber = this.cookieService.get('user_mobile');
      this.authenticationService.timerOtp();
      this.subscribeTimerInfo = this.sharedVarService.getTimerInfoValue().subscribe((value) => {
        this.timeUp = value;
      });
      this.subscribeTimerValue = this.sharedVarService.getTimerValue().subscribe((value) => {
        this.timerShow = value;
      });
    } else {
      if (!this.cookieService.get('user_auth_token')) {
        this.global.errorToastr('Mobile number not found');
      }
      this.router.navigate(['/']);
    }

    // $('.readonlyJim').on('focusout', function () {
    //   $(this).trigger('blur');
    // })

  }



  @HostListener("window:resize", [])
  private onResize() {
    this.onResizeScreen();
  }

  onResizeScreen() {
    this.screenWidth = window.innerWidth;
  }

  moveToLoginScreen() {
    if (this.isFromRmportal || this.byRmLogin) {
      window.location.href = `${environment.logoutRedirectUrl}`;
    } else {
      if (this.cookieService.get('app_id')) {
        this.router.navigate(['/'], { queryParams: { appInstanceId: this.cookieService.get('app_id') } });
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  ngOnDestroy() {
    this.authenticationService.destroyTimer();
    this.subscribeContentData && this.subscribeflowData.unsubscribe();
    this.subscribeContentData && this.subscribeContentData.unsubscribe();
    this.subscribeTimerValue && this.subscribeTimerValue.unsubscribe();
    this.subscribeTimerInfo && this.subscribeTimerInfo.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.myInputField.nativeElement.focus();
    }, 1000);
  }



  /* Common login function on frist step
  * @param paramObj 
  */
  commonLoginApi(paramObj: any) {
    let mfapp = '0';
    if (window.localStorage.getItem('mfapp')) {
      mfapp = window.localStorage.getItem('mfapp');
    }
    paramObj['mfapp'] = mfapp;
    paramObj['portal'] = environment.portal;
    this.authenticationService.commonLoginApi(paramObj).subscribe((res: any) => {
      if (res.success) {
        if (res.result) {
          if (res?.result?.token) {
            // this.cookieService.set('user_auth_token', res.result.token);
            this.global.setCookieAuthUserToken(res.result.token);
          }
          if (this.commonConfigFlow?.isEmailVerificationRequired && !res?.result?.config_info?.isEmailVerified && this.commonConfigFlow.login_type === 'Email_Password') {
            if (res?.result?.SSO) {
              window.location.href = environment.googleSignUpUrl;
            }
          } else {
            let dateObj: any = new Date();
            dateObj = dateObj.setTime(dateObj.getTime() + (Number(res.result.otpMaxTime) * 1000)); // for 10 minute
            this.cookieService.set('otpMaxTime', dateObj, this.global.getCookieExpiredTime());
            this.cookieService.set('user_mobile', res.result.mobile_number, this.global.getCookieExpiredTime());
            this.mobileNumber = res.result.mobile_number;
            this.authenticationService.timerOtp();
            this.sharedVarService.getTimerInfoValue().subscribe((value) => {
              this.timeUp = value;
            });
            this.sharedVarService.getTimerValue().subscribe((value) => {
              this.timerShow = value;
            });
            if (res.result.mobile_number) {
              this.cookieService.set('user_mobile', res.result.mobile_number, this.global.getCookieExpiredTime());
            }
            if (res.result.token) {
              // this.cookieService.set('user_auth_token', res.result.token);
              this.global.setCookieAuthUserToken(res.result.token);
            }
            let newDateObj: any = new Date();
            newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(res.result.otpMaxTime) * 1000)); // for 10 minute
            this.cookieService.set('otpMaxTime', newDateObj, this.global.getCookieExpiredTime());
            // this.cookieService.set('user_mobile', res.result.mobile_number, this.global.getCookieExpiredTime());
          }
        } else {
          if (res.message) {
            this.global.errorToastr(res.message);
          }
        }
      } else {
        if (res?.result?.arihant_system) {
          this.mobileExistInSystem(res?.result?.mobile_number); return;
        }
        if (res?.message) {
          this.global.errorToastr(res.message);
        }
        this.router.navigate(['/']);
      }
    }, (error: HttpErrorResponse) => {
      if (error.status === 400) {
        this.router.navigate(['/welcome']);
      }
    });
  }

  /**
  * Mobile Number Already Exist Modal popup
  */
  mobileNumberExist: any;
  mobileExistInSystem(mobile: any = "") {
    this.mobileNumberExist = mobile;
    this.modalService.open(this.mobileNumberSystemExist, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => {
      if (result === 'ok') {
        this.spinner.show();
        window.location.href = `${environment.clientLogin}`;
      } else if (result === 'cancel') {
        this.spinner.show();
        window.location.href = `${environment.login_redirect_page}`;
      }
    });
  }

  modelSubmit($event: any) {
    // console.log("$event detected", $event);
    if ($event && $event.length === 6) {
      this.onSubmit();
    }
  }

  autoSubmit($event: any) {
    if ($event && $event.target.value.length === 6) {
      this.onSubmit();
    }
  }

  onSubmit() {
    if (this.otpform.valid) {
      let mfapp = '0';
      if (window.localStorage.getItem('mfapp')) {
        mfapp = window.localStorage.getItem('mfapp');
      }

      if (this.commonConfigFlow.login_type === 'Mobile_OTP') {
        const paramObj = { 'mobile_number': this.mobileNumber, 'otp': this.otpform.value.otp, 'login_type': this.commonConfigFlow.login_type };
        paramObj['mfapp'] = mfapp;
        if (this.byRmLogin) {
          this.route.queryParams.subscribe(params => {
            paramObj['token'] = params['token'];
          })
        }
        this.route.queryParams.subscribe(params => {
          if (params['appInstanceId']) {
            paramObj['app_instance_id'] = params['appInstanceId'];
            this.cookieService.set('app_id', paramObj['app_instance_id']);
          }
        });
        paramObj['portal'] = environment.portal;
        this.authenticationService.commonLoginApi(paramObj).subscribe(async (res: any) => {
          if (res.success) {
            /************************ GA TAG PUSH : START ********************/
            let utmSource = '';
            let utmMedium = '';
            this.route.queryParams.subscribe(params => {
              if (params['utm_source']) {
                utmSource = params['utm_source'];
              }
              if (params['utm_medium']) {
                utmMedium = params['utm_medium'];
              }
            })
            this.global.setPushToGTM({
              'event': 'mobile_submit_otp',
              'Page_Location': this.router.url.split('?')[0],
              'Page_referrer': this.global?.previousUrl,
              'CTA_text': 'Auto Submit',
              'FormID': 'form id',
              'user_id': `mobile_OTP_${this.mobileNumber}`,
              'UTM_source': utmSource ? utmSource : '',
              'UTM_medium': utmMedium ? utmMedium : '',
            });
            /************************ GA TAG PUSH : STOP ********************/

            fbq('track', 'Lead');
            if (res.result.token) {
              if (environment.userExperior && this.global.globalUserExperiorSet) {
                ue.setUserIdentifier(this.mobileNumber);
                this.global.logEventUserExperior("OTP Verified Successfully");
              }

              this.global.deleteMultiCookies(['user_token', 'user_mobile', 'otpMaxTime', 'email', 'mfapp']);
              if (res?.result?.token) {
                // this.cookieService.set('user_auth_token', res.result.token);
                this.global.setCookieAuthUserToken(res.result.token);
                this.sharedVarService.setValue(true);
              }

              if (res?.result?.refreshToken) {
                this.global.setRefreshToken(res?.result?.refreshToken);
              }
              this.sharedVarService.setConfigStepData(res.result.config_info);
              if (!res.result.config_info.step_3) {
                if (this.commonConfigFlow.step3 === 'email') {
                  this.router.navigate(['register-email']);
                } else if (this.commonConfigFlow.step3 === 'pan_dob') {
                  this.router.navigate(['register-pan-dob']);
                }
              } else if (!res.result.config_info.step_4) {
                if (this.commonConfigFlow.step4 === 'email') {
                  this.router.navigate(['register-email']);
                } else if (this.commonConfigFlow.step4 === 'pan_dob') {
                  this.router.navigate(['register-pan-dob']);
                }
              } else if (res.result.config_info.step_3 && res.result.config_info.step_4) {
                // this.global.generateToken().subscribe(async (res: any) => {
                //   if (res.success) {
                let userD: any = {};
                if (res?.result?.appId) {
                  userD['appId'] = res?.result?.appId;
                }
                if (res?.result?.panUserName) {
                  userD['panUserName'] = res?.result?.panUserName;
                }
                this.cookieService.set('user', JSON.stringify(userD));
                this.sharedVarService.setLoggedUserInfoValue(userD);

                if (res.result.token) {
                  // this.cookieService.set('user_auth_token', res.result.token);
                  this.global.setCookieAuthUserToken(res.result.token);
                }
                if (res?.result?.stepInfo) {
                  this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
                  if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
                    this.global.globalLoaderMessage(this.translate.instant('kra_verifying_loader_message'));
                    setTimeout(async () => {
                      await this.global.verifyPanDetails();
                    }, 500);
                  }
                  if (res.result.stepInfo.isEKYCComplete === 1) {
                    this.global.globalLoaderMessage();
                    this.router.navigate(['thank-you']);
                  } else {
                    this.global.globalLoaderMessage();
                    if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
                      this.global.redirectToFirstUnVerifiedPage(res?.result?.stepInfo);
                    } else {
                      this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
                    }
                  }
                  return;
                }
                this.router.navigate(['welcome']);
                //   }
                // });
              }

            } else {
              this.router.navigate(['mobile-verify']);
            }
          } else {
            if (res?.result?.otpExpire) {
              this.ngOnDestroy();
              this.timeUp = true;
            }
            if (res.message) {
              this.global.errorToastr(res.message);
            }
          }
        }, (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.router.navigate(['/welcome']);
          }
        });
      } else {
        const obj = { 'validation_type': 'otp' };
        obj['otp'] = this.otpform.value.otp;
        this.global.commonValidation(obj).subscribe((res: any) => {
          if (res.success) {
            if (res?.result?.config_info) {
              this.getCheckConfigInfo(res?.result?.config_info);
            } else {
              this.global.configInfo().subscribe(async (result: any) => {
                if (result.success) {
                  this.sharedVarService.setConfigStepData(result.result.config_info);
                  if (!result.result.config_info.step_3) {
                    if (this.commonConfigFlow.step3 === 'email') {
                      this.router.navigate(['register-email']);
                    } else if (this.commonConfigFlow.step3 === 'pan_dob') {
                      this.router.navigate(['register-pan-dob']);
                    }
                  } else if (!result.result.config_info.step_4) {
                    if (this.commonConfigFlow.step4 === 'email') {
                      this.router.navigate(['register-email']);
                    } else if (this.commonConfigFlow.step4 === 'pan_dob') {
                      this.router.navigate(['register-pan-dob']);
                    }
                  } else {
                    let userD: any = {};
                    if (res?.result?.appId) {
                      userD['appId'] = res?.result?.appId;
                    }
                    if (res?.result?.panUserName) {
                      userD['panUserName'] = res?.result?.panUserName;
                    }
                    this.cookieService.set('user', JSON.stringify(userD));
                    this.sharedVarService.setLoggedUserInfoValue(userD);

                    if (res.result.token) {
                      // this.cookieService.set('user_auth_token', res.result.token);
                      this.global.setCookieAuthUserToken(res.result.token);
                    }
                    if (res?.result?.stepInfo) {
                      this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
                      if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
                        await this.global.verifyPanDetails();
                      }
                      if (res.result.stepInfo.isEKYCComplete === 1) {
                        this.router.navigate(['thank-you']);
                      } else {
                        if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
                          this.global.redirectToFirstUnVerifiedPage(res?.result?.stepInfo);
                        } else {
                          this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
                        }
                      }
                      return;
                    }
                    this.router.navigate(['welcome']);
                  }
                }
              });
            }
          } else {
            this.global.errorToastr(res.message);
          }
        });

      }

    } else {
      this.validate.validateAllFormFields(this.otpform);
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
    }
  }

  /**
   * Get check config info of steps
   */
  getCheckConfigInfo(config_info: any) {
    this.sharedVarService.setConfigStepData(config_info);
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
            // this.cookieService.set('user_auth_token', res.result.token);
            this.global.setCookieAuthUserToken(res.result.token);
            if (res?.result?.stepInfo) {
              let userD: any = {};
              if (res?.result?.appId) {
                userD['appId'] = res?.result?.appId;
              }
              if (res?.result?.panUserName) {
                userD['panUserName'] = res?.result?.panUserName;
              }
              this.cookieService.set('user', JSON.stringify(userD));
              this.sharedVarService.setLoggedUserInfoValue(userD);

              this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
              if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
                await this.global.verifyPanDetails();
              }
              if (res.result.stepInfo.isEKYCComplete === 1) {
                this.router.navigate(['thank-you']);
              } else {
                if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
                  this.global.redirectToFirstUnVerifiedPage(res?.result?.stepInfo);
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
          // this.cookieService.set('user_auth_token', res.result.token);
          this.global.setCookieAuthUserToken(res.result.token);
          if (res?.result?.stepInfo) {
            let userD: any = {};
            if (res?.result?.appId) {
              userD['appId'] = res?.result?.appId;
            }
            if (res?.result?.panUserName) {
              userD['panUserName'] = res?.result?.panUserName;
            }
            this.cookieService.set('user', JSON.stringify(userD));
            this.sharedVarService.setLoggedUserInfoValue(userD);

            this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
            if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
              await this.global.verifyPanDetails();
            }
            if (res.result.stepInfo.isEKYCComplete === 1) {
              this.router.navigate(['thank-you']);
            } else {
              if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
                this.global.redirectToFirstUnVerifiedPage(res?.result?.stepInfo);
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

  verifyPanDetails() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.authenticationService.verifyPanDetailsByKRA().subscribe((res: any) => {
          if (res.success) {
            this.sharedVarService.setStepsInfo(res.result);
            resolve(true);
          } else {
            resolve(true);
          }
        });
      }, 100);
    });
  }

  /**
   * Resend otp to mobile number
   * @Header Authorization token 
   */
  resendOtp(mobileNumber: any) {
    this.auth.resendOTP(mobileNumber);
  }

}
