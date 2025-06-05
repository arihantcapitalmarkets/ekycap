import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { AuthenticationService } from '../authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialoge.service';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from "../../shared/shared.module";
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";

import { CookieService } from 'ngx-cookie-service';
import { CommonLeftportionComponent } from '../common-leftportion/common-leftportion.component';
import {
  SocialAuthService,
  GoogleLoginProvider,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-register-email',
  templateUrl: './register-email.component.html',
  styleUrls: ['./register-email.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, ControlMessagesComponent, CommonLeftportionComponent, GoogleSigninButtonModule]
})
export class RegisterEmailComponent implements OnInit {
  public registerform: FormGroup;
  mobileNumber: any;
  validMobileEmail: boolean;
  setDisabledEmail = false;
  showButtonLoader = false;
  commonConfigFlow: any;
  isEmailExist: boolean;
  isEmailExistMessage: any;
  contentData: any;
  noteVerifiycationEmailText: any;
  needEmailId: any;

  obs: Subscription;
  subscribeGetConfigFlowData: Subscription;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public validate: ValidationService,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
    public global: GlobalService,
    private confirmationDialogService: ConfirmationDialogService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    config: NgbDatepickerConfig,
    private sharedVarService: SharedVarService,
    public translate: TranslateService,
    private socialAuthService: SocialAuthService,
  ) {
    const currentDate = new Date();
    config.minDate = { year: 1947, month: 1, day: 1 };
    config.maxDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    config.outsideDays = 'hidden';
    this.needEmailId = this.translate?.instant('need_email_id');
  }

  async ngOnInit() {
    this.global.globalLoaderMessage();
    this.route.queryParams.subscribe(async (params: any) => {
      if (params['email']) {
        const checkEmailObj = { 'email': params['email'] };
        this.authenticationService.checkEmailExist(checkEmailObj).subscribe(async (res: any) => {
          if (res.result.type === 1) {
            this.cookieService.set('user_token', res?.result?.token, this.global.getCookieExpiredTime());
            this.cookieService.set('email', res?.result?.email, this.global.getCookieExpiredTime());
            await this.setValidateTheForm();
          } else {
            this.router.navigate(['/']);
          }
        })
      }
      if (params['fb']) {
        const Obj = { 'code': params['fb'] };
        this.authenticationService.getAccessTokenFromFB(Obj).subscribe(async (res: any) => {
          if (res.result.type === 1) {
            this.cookieService.set('user_token', res?.result?.token, this.global.getCookieExpiredTime());
            if (res?.result?.email) {
              this.cookieService.set('email', res?.result?.email, this.global.getCookieExpiredTime());
            }
            await this.setValidateTheForm();
          } else {
            this.router.navigate(['/']);
          }
        })
      }
    });


    this.obs = this.sharedVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.noteVerifiycationEmailText = data?.note_verifiycation_email_text;
      }
    });

    const panUsername = new FormControl('', [ValidationService.required, Validators.maxLength(10), ValidationService.panValidator]);
    const dob = new FormControl('', [ValidationService.required, ValidationService.dobValidator]);
    await this.setValidateTheForm();
    this.subscribeGetConfigFlowData = this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      } else {
        this.global.setConfigFlow();
      }
    });
    this.global.logEventUserExperior("Landing on Email Address Screen");
    this.socialAuthService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      if (this.user) {
        const resObj: any = this.user
        resObj['authToken'] = this.user.idToken
        this.googleAuthVerification(resObj);
      }
    });
    // this.initializeGsi();
  }

  /**************************************** angularx-social-login :Start **********************************/
  user: any;
  loggedIn: boolean = false;
  accessToken: any;
  googleAuthVerification(resObj: any) {
    console.log('resObj', resObj);
    this.authenticationService.googleIdTokenValidate(resObj).subscribe((res: any) => {
      // console.log('google verification', res);
      if (res.success) {
        this.global.globalLoaderMessage();
        if (res?.result?.config_info) {
          this.getCheckConfigInfo(res?.result?.config_info, res);
        } else {
          this.global.configInfo().subscribe((result: any) => {
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

                    // this.cookieService.put('user_auth_token', res.result.token);
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
          });
        }
      } else {
        if (res.message) {
          this.isEmailExist = true;
          this.isEmailExistMessage = res.message;
          this.global.errorToastr(res.message);
        }
      }
    })
    // console.log('accessToken', this.accessToken);

    // });
  }
  /**************************************** angularx-social-login :END **********************************/

  /**************************************** GSI Library :Start **********************************/
  clientId: string = environment.googleClientID;
  initializeGsi(): void {
    (window as any).google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      scope: 'profile email https://www.googleapis.com/auth/drive', // Add any additional scopes you need
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById('gsi-button'),
      { theme: 'outline', size: 'large' } // Customize button appearance
    );

    // Optional: Automatically prompt user
    (window as any).google.accounts.id.prompt();
  }
  fetchAccessToken(idToken: string): void {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive',
      callback: (tokenResponse: any) => {
        console.log('Access Token:', tokenResponse.access_token);
        this.accessToken = tokenResponse.access_token;
      },
    });

    // Trigger the OAuth flow to get the access token
    client.requestAccessToken();
  }

  handleCredentialResponse(response: any): void {
    console.log('response', response);
    console.log('Encoded JWT ID token:', response.credential);
    // Send this token to your backend server for verification and further processing
  }
  /**************************************** GSI Library :END **********************************/

  loginWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((resObj: any) => {
      // console.log('res', resObj);
      this.authenticationService.googleEmailVerify(resObj).subscribe((res: any) => {
        // console.log('google verification', res);
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
            'event': 'email_verify_using_google',
            'Page_Location': this.router.url.split('?')[0],
            'Page_referrer': this.global?.previousUrl,
            'CTA_text': 'Continue',
            'FormID': 'form id',
            'user_id': `email_verify_using_google${Math.random()}`,
            'UTM_source': utmSource ? utmSource : '',
            'UTM_medium': utmMedium ? utmMedium : '',
          });
          /************************ GA TAG PUSH : STOP ********************/
          this.global.globalLoaderMessage();
          if (res?.result?.config_info) {
            this.getCheckConfigInfo(res?.result?.config_info, res);
          } else {
            this.global.configInfo().subscribe((result: any) => {
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
            });
          }
        } else {
          if (res.message) {
            this.isEmailExist = true;
            this.isEmailExistMessage = res.message;
          }
          this.global.errorToastr(res.message);
        }
      })
    });
  }

  /**
   * Set validation the form
   */
  setValidateTheForm() {
    this.registerform = this.fb.group({
      email: ['', Validators.compose([ValidationService.requiredCustome, ValidationService.emailValidator, Validators.maxLength(320)])],
    });

    if (this.cookieService.get('email')) {
      this.setDisabledEmail = true;
      this.registerform.patchValue({ email: this.cookieService.get('email') });
    } else {
      this.registerform.get('email').setValidators([ValidationService.requiredCustome, ValidationService.emailValidator, Validators.maxLength(320)]);
      this.registerform.get('email').updateValueAndValidity();
    }
  }

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }
  emailOption: string;
  onChooseEmailOption(emailOption: string) {
    if (this.registerform?.value?.email) {
      let setEmailValue: string;
      const getEmail = this.registerform.value.email;
      const result = getEmail.split('@')[0];
      this.registerform.controls.email.setValue(result);
      if (emailOption === '@gmail.com' || emailOption === '@gmail.co.in' || emailOption === '@yahoo.com' || emailOption === '@yahoo.co.in' || emailOption === '@rediff.com' || emailOption === '@hotmail.com' || emailOption === '@outlook.com') {
        setEmailValue = `${this.registerform.value.email}${emailOption}`;
        this.emailOption = emailOption;
      }
      this.registerform.controls.email.setValue(setEmailValue);
    } else {
      this.emailOption = '';
      return this.registerform.markAllAsTouched();
    }
  }

  onSubmit() {
    if (this.registerform.valid) {
      const objCheckMobileEmail = {
        email: this.registerform.value.email,
      };

      const obj = { 'validation_type': 'email' };
      if (!this.cookieService.get('email')) {
        obj['email'] = this.registerform.value.email;
      }
      if (this.commonConfigFlow.login_type === 'Mobile_OTP') {
        this.global.globalLoaderMessage(this.translate.instant('email_verifying_loader_message'));
        this.global.commonValidation(obj).subscribe((res: any) => {
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
              'event': 'email_get_otp',
              'Page_Location': this.router.url.split('?')[0],
              'Page_referrer': this.global?.previousUrl,
              'CTA_text': 'Continue',
              'FormID': 'form id',
              'user_id': `email_get_otp_${Math.random()}`,
              'UTM_source': utmSource ? utmSource : '',
              'UTM_medium': utmMedium ? utmMedium : '',
            });
            /************************ GA TAG PUSH : STOP ********************/
            this.global.logEventUserExperior("Email Address Added");
            this.global.globalLoaderMessage();
            if (res?.result?.config_info) {
              this.getCheckConfigInfo(res?.result?.config_info, res);
            } else {
              this.global.configInfo().subscribe((result: any) => {
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
              });
            }
            // if (res?.result?.isMobileExists && res?.result?.isEmailExists) {
            //   this.openModalPopup('isMobileExists', res?.result);
            // } else if (res?.result?.isMobileExists) {
            //   this.openModalPopup('isMobileExists');
            // } else if (res?.result?.isEmailExists) {
            //   this.openModalPopup('isEmailExists');
            // } else {
            //   this.cd.detectChanges();
            //   setTimeout(() => {
            //     this.submitData(obj);
            //   }, 100);
            // }
          } else {
            if (res.message) {
              this.isEmailExist = true;
              this.isEmailExistMessage = res.message;
            }
            this.global.errorToastr(res.message);
          }
        });
      } else {
        this.global.commonValidation(obj).subscribe((res: any) => {
          if (res.success) {
            if (res?.result?.config_info) {
              this.getCheckConfigInfo(res?.result?.config_info, res);
            } else {
              this.global.configInfo().subscribe((result: any) => {
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
              });
            }
            // if (res?.result?.isMobileExists && res?.result?.isEmailExists) {
            //   this.openModalPopup('isMobileExists', res?.result);
            // } else if (res?.result?.isMobileExists) {
            //   this.openModalPopup('isMobileExists');
            // } else if (res?.result?.isEmailExists) {
            //   this.openModalPopup('isEmailExists');
            // } else {
            //   this.cd.detectChanges();
            //   setTimeout(() => {
            //     this.submitData(obj);
            //   }, 100);
            // }
          } else {
            if (res.message) {
              this.isEmailExist = true;
              this.isEmailExistMessage = res.message;
            }
            this.global.errorToastr(res.message);
          }
        });
      }
      // this.cookieService.set('user_token', 'token', this.global.getCookieExpiredTime());
      // this.router.navigate(['mobile-verify']);

    } else {
      this.validate.validateAllFormFields(this.registerform);
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
    }
  }

  /**
   * Get check config info of steps
   */
  async getCheckConfigInfo(config_info: any, res) {
    if (this.commonConfigFlow?.isEmailVerificationRequired && !config_info?.isEmailVerified) {
      this.openModalPopup('emailVerification'); return;
    } else {
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
            // this.cookieService.set('user_auth_token', res.result.token, this.global.getCookieExpiredAuthTokenTime());
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
                this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
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
          // this.cookieService.set('user_auth_token', res.result.token, this.global.getCookieExpiredAuthTokenTime());
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
              this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
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
    }

  }

  /**
   * Open modal popup
   * @param forWhat: open modal popup 
   * @param checkingData: recursively check
   */
  openModalPopup(forWhat: any = '', checkingData: any = '') {
    // const obj = {
    //   // email: this.registerform.value.email,
    //   mobile_number: this.registerform.value.mobilenumber,
    //   pan_username: this.registerform.value.pan_username.toUpperCase(),
    //   dob: this.registerform.value.dob,
    // };
    // if (!this.cookieService.get('email')) {
    //   obj['email'] = this.registerform.value.email;
    // }

    let popupParam = {}
    popupParam['button_name_left'] = 'Re-Enter';
    popupParam['button_name_right'] = 'Use The Same';
    popupParam['lable'] = 'Alert';
    if (forWhat === 'isMobileExists') {
      popupParam['type'] = 'isMobileExists';
      popupParam['title'] = 'Mobile already registered!';
      this.confirmationDialogService.alertMessageAndConfirm(popupParam).then((data) => {
        if (data) {
          if (!checkingData?.isEmailExists) {
            // this.validMobileEmail = true;

          } else {
            this.openModalPopup('isEmailExists');
          }
        }
      }).catch(error => console.log(error));
    } else if (forWhat === 'isEmailExists') {
      popupParam['type'] = 'isEmailExists';
      popupParam['title'] = 'Email already registered!';
      this.confirmationDialogService.alertMessageAndConfirm(popupParam).then((data) => {
        if (data) {

        }
      }).catch(error => console.log(error));
    } else if (forWhat === 'emailVerification') {
      popupParam['type'] = 'isEmailExists';
      popupParam['title'] = 'Email already registered!';
      this.confirmationDialogService.emailVerification(popupParam).then((data) => {
        if (data) {

        }
      }).catch(error => console.log(error));
    }
  }

  /***
   * submit data to move forward to get OTP screen
   */
  submitData(obj: any) {
    this.showButtonLoader = true;
    this.spinner.show();
    this.authenticationService.register(obj).subscribe((res: any) => {
      if (res.success) {
        this.spinner.hide();
        this.global.successToastr(res.message);
        this.mobileNumber = this.registerform.value.mobilenumber;
        this.cookieService.set('user_mobile', this.mobileNumber, this.global.getCookieExpiredTime());
        this.cookieService.set('user_token', res.result, this.global.getCookieExpiredTime());
        let newDateObj: any = new Date();
        newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(120) * 1000)); // for 10 minute
        this.cookieService.set('otpMaxTime', newDateObj, this.global.getCookieExpiredTime());
        this.showButtonLoader = false;
        this.router.navigate(['mobile-verify']);
      } else {
        this.spinner.hide();
        this.showButtonLoader = false;
        if (res?.result?.isPanExistsInKYC) {
          this.preventToSamePan();
        } else if (res?.result?.isPanExistsInVendor) {
          let popupParam = {}
          popupParam['type'] = 'isPanExist';
          popupParam['lable'] = 'Alert';
          popupParam['title'] = 'PAN already registered!';
          popupParam['button_name_left'] = 'Register New PAN Number';
          popupParam['button_name_right'] = 'Login';
          this.confirmationDialogService.alertMessageAndConfirm(popupParam).then((data) => {
            if (data) {
              window.location.href = environment.login_redirect_page;
              // this.router.navigate(['/']);
              // this.loginAuthentication(obj);
            } else {
              this.setValidateTheForm();
            }
          }).catch(error => console.log(error));
        }

      }
    }, (error) => { this.showButtonLoader = false; this.spinner.hide(); });
  }

  /**
   * User move to login directly if he/she already registered with PAN 
   * @param obj 
   */
  loginAuthentication(obj: any) {
    this.authenticationService.login(obj).subscribe((res: any) => {
      if (res.success) {
        this.global.successToastr(res.message);
        this.cookieService.set('login_user_mobile', res.result.mobileNumber, this.global.getCookieExpiredTime());
        this.cookieService.set('login_user_token', res.result.token, this.global.getCookieExpiredTime());
        if (res.result.otpMaxTime) {
          let newDateObj: any = new Date();
          newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(res.result.otpMaxTime) * 1000)); // for 10 minute
          this.cookieService.set('otpMaxTime', newDateObj, this.global.getCookieExpiredTime());
        }
        this.router.navigate(['login-otp']);
      } else {
        this.global.errorToastr(res.message);
      }
    });
  }

  preventToSamePan() {
    let popupParam = {}
    popupParam['type'] = 'isPanExist';
    popupParam['lable'] = 'Alert';
    popupParam['title'] = 'PAN already registered!';
    popupParam['button_name_left'] = 'Register New PAN Number';
    popupParam['button_name_right'] = 'Login';
    this.confirmationDialogService.alertMessageAndConfirm(popupParam).then((data) => {
      if (data) {
        // window.location.href = environment.login_redirect_page;
        this.router.navigate(['/']);
        // this.loginAuthentication(obj);
      } else {
        this.setValidateTheForm();
      }
    }).catch(error => console.log(error));
  }

  ngOnDestroy(): void {
    // console.log('test unsubscribe', this.contentData);
    this.obs && this.obs.unsubscribe();
    this.subscribeGetConfigFlowData && this.subscribeGetConfigFlowData.unsubscribe();
  }


}
