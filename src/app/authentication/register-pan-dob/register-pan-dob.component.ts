import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { AuthenticationService } from '../authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialoge.service';
import { NgbDatepickerConfig, NgbDateParserFormatter, NgbDateAdapter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParserFormatter, CustomAdapter } from 'src/app/shared/customeAdapter';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SharedModule } from "../../shared/shared.module";
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";
import { CommonLeftportionComponent } from '../common-leftportion/common-leftportion.component';
import { DateMaskDirective } from 'src/app/shared/directives/date-mask.directive';

declare let fbq: any;

@Component({
  selector: 'app-register-pan-dob',
  templateUrl: './register-pan-dob.component.html',
  styleUrls: ['./register-pan-dob.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ],
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule, CommonModule, PipesModule, TranslateModule, NgbModule, ControlMessagesComponent, CommonLeftportionComponent, DateMaskDirective]
})
export class RegisterPanDobComponent implements OnInit {
  public registerform: UntypedFormGroup;
  maxDate = new Date();
  mobileNumber: any;
  validMobileEmail: boolean;
  setDisabledEmail = false;
  showButtonLoader = false
  commonConfigFlow: any;
  isPanExist: Boolean;
  isPanExistMessage: any;
  isPanNotValid: any;
  contentData: any;
  fetchingData: boolean;
  configInfo: any;
  noteVerifiycationPanDobText: any;
  invalidPanPromptPan: any;
  verifyDobMandatory: any;
  redirectUrl = `${environment.login_redirect_page}`;
  isAadharLinkWithPan = true;
  calenderPadding: any;

  invalidDOBMessage: string;
  invalidFullNameMessage: string;
  invalidPANMessage: string;
  constructor(
    public fb: UntypedFormBuilder,
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
    private translate: TranslateService
    // private datepipe: DatePipe
  ) {
    const currentDate = new Date();
    config.minDate = { year: 1930, month: 1, day: 1 };
    config.maxDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    config.outsideDays = 'hidden';
    this.invalidPanPromptPan = this.translate?.instant('invalid_pan_prompt_pan');
    this.verifyDobMandatory = this.translate?.instant('verify_dob_mandatory');

  }

  async ngOnInit() {
    this.calenderPadding = 80;
    if (this.global.isMobileDevice) {
      this.calenderPadding = 110;
    }
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
        this.noteVerifiycationPanDobText = data?.note_verifiycation_pan_dob_text;
      }
    });
    const panUsername = new UntypedFormControl('', [ValidationService.required, Validators.maxLength(10), ValidationService.panValidator]);
    const dob = new UntypedFormControl('', [ValidationService.required, ValidationService.dobValidator, ValidationService.AgeValidator]);
    await this.setValidateTheForm();
    await this.getAuthFlowConfigData();

    await this.getSharedConfigFlow();
    this.global.logEventUserExperior("Landing on PAN DOB Screen");
  }

  /**
   * Get Back To Home Page
   */
  getBackToHomePage() {
    this.global.deleteMultiCookies(['user_token', 'user_mobile', 'otpMaxTime', 'user_auth_token']);
    const redirectUrl = `${environment.login_redirect_page}`;
    window.location.href = redirectUrl;
  }

  getSharedConfigFlow() {
    this.subscribeGetConfigFlowData = this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      } else {
        this.global.setConfigFlow();
      }
    });
  }
  subscribeGetConfigFlowData: Subscription;
  subscribeConfigInfo: Subscription;
  obs: Subscription;
  getAuthFlowConfigData() {
    this.subscribeConfigInfo = this.global.configInfo().subscribe((result: any) => {
      if (result.success) {
        this.configInfo = result?.config_info;
      }
    });
  }

  dateFunction() {
    console.log('dateFunction');
    const date = new Date();
    // let latest_date = this.datepipe.transform(date, 'yyyy-MM-dd');
  }

  /**
   * Set validation the form
   */





  setValidateTheForm() {
    this.registerform = this.fb.group({
      name: ['', Validators.compose([ValidationService.required, ValidationService.onlyAlphabeticAllowApostrophe])],
      pan_username: ['', Validators.compose([ValidationService.requiredCustome, Validators.maxLength(10), ValidationService.panValidator])],
      dob: ['', Validators.compose([ValidationService.required, ValidationService.dobValidator, ValidationService.AgeValidator])],
    });

    // if (this.cookieService.get('email')) {
    //   this.setDisabledEmail = true;
    //   this.registerform.patchValue({ email: this.cookieService.get('email') });
    // } else {
    //   this.registerform.get('email').setValidators([Validators.required, ValidationService.emailValidator]);
    //   this.registerform.get('email').updateValueAndValidity();
    // }
  }

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  clearMessages($event: any) {
    if ($event.target.value.length < 10) {
      this.isPanExist = false;
      this.isPanExistMessage = '';
      this.isPanNotValid = '';
      this.isAadharLinkWithPan = true;
      this.invalidFullNameMessage = '';
      this.invalidPANMessage = '';
      this.invalidDOBMessage = '';
    }
  }

  clearValidations($event: any) {
    this.isPanExist = false;
    this.isPanExistMessage = '';
    this.isPanNotValid = '';
    this.isAadharLinkWithPan = true;
    this.invalidFullNameMessage = '';
    this.invalidPANMessage = '';
    this.invalidDOBMessage = '';
    if ($event?.target?.value.length > 1) {
      this.nsdlPanDivide($event.target.value);
    } else {
      this.nsdlPanNameCheck = '';
    }
  }

  nsdlPanDivide(full_name: string) {
    let name: any = full_name;
    name = name.trimStart();
    name = name.trimEnd();
    let splitName: any = name.split(" ");
    // console.log(splitName)
    let nsdlFirstName = '';
    let nsdlMiddleName = '';
    let nsdlLastName = '';
    let nsdlFullName = name;
    if (splitName.length === 1) {
      nsdlFirstName = splitName[0];
    } else if (splitName.length === 2) {
      nsdlFirstName = splitName[0];
      nsdlLastName = splitName[1];
    } else {
      splitName.map((val, key) => {
        // console.log('key', key);
        // console.log('va', val)
        if (key === 0) {
          nsdlFirstName = val;
        } else if (key === 1) {
          nsdlMiddleName = val;
        } else {
          nsdlLastName += val + " ";
        }

      })
    }

    const nsdlPanNameCheck = {
      nsdlFirstName: nsdlFirstName,
      nsdlMiddleName: nsdlMiddleName,
      nsdlLastName: nsdlLastName,
      nsdlFullName: nsdlFullName
    };
    this.nsdlPanNameCheck = nsdlPanNameCheck;
    // console.log('nsdlPanNameCheck', nsdlPanNameCheck);
  }
  nsdlPanNameCheck: any = '';

  onSubmit() {
    this.isPanExist = false;
    if (this.registerform.valid) {

      const obj = {
        full_name: this.registerform.value.name,
        pan: this.registerform.value.pan_username.toUpperCase(),
        dob: this.registerform.value.dob,
      };

      obj['validation_type'] = 'pan_dob';
      if (environment.panDobVersion) {
        obj['validation_type'] = 'pan_dob_v1';
      }

      this.global.globalLoaderMessage(this.translate.instant('pan_verify_details_loader_message'));
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
        'event': 'pan_added',
        'Page_Location': this.router.url.split('?')[0],
        'Page_referrer': this.global?.previousUrl,
        'CTA_text': 'Submit',
        'FormID': 'form id',
        'user_id': `pan_added${Math.random()}`,
        'UTM_source': utmSource ? utmSource : '',
        'UTM_medium': utmMedium ? utmMedium : '',
      });
      /************************ GA TAG PUSH : STOP ********************/
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
            'event': 'pan_added_success',
            'Page_Location': this.router.url.split('?')[0],
            'Page_referrer': this.global?.previousUrl,
            'CTA_text': 'Submit',
            'FormID': 'form id',
            'user_id': `pan_added_success${Math.random()}`,
            'UTM_source': utmSource ? utmSource : '',
            'UTM_medium': utmMedium ? utmMedium : '',
          });
          /************************ GA TAG PUSH : STOP ********************/
          fbq('track', 'CompleteRegistration');
          this.global.logEventUserExperior("Pan DOB Submitted");
          if (res?.result?.config_info) {
            this.global.globalLoaderMessage();
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
                  } else if (this.commonConfigFlow.step3 === 'otp') {
                    this.router.navigate(['mobile-verify']);
                  }
                } else if (!result.result.config_info.step_4) {
                  if (this.commonConfigFlow.step4 === 'email') {
                    this.router.navigate(['register-email']);
                  } else if (this.commonConfigFlow.step4 === 'pan_dob') {
                    this.router.navigate(['register-pan-dob']);
                  } else if (this.commonConfigFlow.step4 === 'otp') {
                    this.router.navigate(['mobile-verify']);
                  }
                } else {
                  this.router.navigate(['welcome']);
                }
              }
            });
          }
        } else {
          if (res?.result?.flag === 1 || res?.result?.flag === 2) {
            this.isPanExist = true;
            this.isPanExistMessage = res.message;
          } else if (res?.result?.flag === 3) {
            // this.isPanNotValid = res.message;
            if (res?.result?.isInvalidDob) {
              this.invalidDOBMessage = `It's seems your Date of birth is not matched with pan card please add date of birth which printed on pan card`;
            }
            if (res?.result?.isInvalidFullName) {
              this.invalidFullNameMessage = `It's seems your name is not matched with pan card please add name which printed on pan card`;
            }
            if (res?.result?.isInvalidPan) {
              this.isPanNotValid = res.message;
            }
          } else if (res?.result?.hasOwnProperty("isAadharLinkWithPan") && !res?.result?.isAadharLinkWithPan) {
            this.isAadharLinkWithPan = false;
          } else if (!res?.result?.isEmailAdded) {
            this.global.errorToastr('Please verify your email address');
            this.router.navigate(['register-email']);
          } else {
            this.isPanNotValid = res.message;
            if (res?.message) {
              this.global.errorToastr(res.message);
            }
          }
        }
      });
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
        this.showButtonLoader = true;
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
            // this.global.globalLoaderMessage(this.translate.instant('kra_verifying_loader_message'));
            this.global.globalLoaderMessage();
            setTimeout(async () => {
              await this.verifyPanDetails(res);
            }, 500);
          }
          // if (res.result.stepInfo.isEKYCComplete === 1) {
          //   this.router.navigate(['thank-you']);
          // } else {
          //   if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
          //     this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
          //   } else {
          //     this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
          //   }
          // }
          // return;
        }

        this.router.navigate(['welcome']);
      }
    } else {
      this.showButtonLoader = true;
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
          // this.global.globalLoaderMessage(this.translate.instant('kra_verifying_loader_message'));
          this.global.globalLoaderMessage();
          setTimeout(async () => {
            await this.verifyPanDetails(res);
          }, 500);
        } else {
          if (res.result.stepInfo.isEKYCComplete === 1) {
            this.router.navigate(['thank-you']);
          } else {
            if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
              this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
            } else {
              this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
            }
          }
        }
      }

    }
  }

  /**
   * Verify Pan details
   * @param res 
   */
  verifyPanDetails(res: any) {
    // this.fetchingData = true;
    this.authenticationService.verifyPanDetailsByKRA(false).subscribe((result: any) => {
      // element.classList.remove('my-class');
      if (result.success) {
        /************************ GA TAG PUSH : START ********************/
        // let utmSource = '';
        // let utmMedium = '';
        // this.route.queryParams.subscribe(params => {
        //   if (params['utm_source']) {
        //     utmSource = params['utm_source'];
        //   }
        //   if (params['utm_medium']) {
        //     utmMedium = params['utm_medium'];
        //   }
        // })
        // this.global.setPushToGTM({
        //   'event': 'pan_verify_success',
        //   'Page_Location': this.router.url.split('?')[0],
        //   'Page_referrer': this.global?.previousUrl,
        //   'CTA_text': 'Submit',
        //   'FormID': 'form id',
        //   'user_id': `pan_verify_success${Math.random()}`,
        //   'UTM_source': utmSource ? utmSource : '',
        //   'UTM_medium': utmMedium ? utmMedium : '',
        // });
        /************************ GA TAG PUSH : STOP ********************/
        this.global.logEventUserExperior("Pan DOB Verified");
        this.showButtonLoader = false;
        this.sharedVarService.setStepsInfo(res.result);
        if (res.result.stepInfo.isEKYCComplete === 1) {
          this.router.navigate(['thank-you']);
        } else {
          if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
            this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
          } else {
            this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
          }
        }
        this.global.globalLoaderMessage();
      } else {
        if (res.result.stepInfo.isEKYCComplete === 1) {
          this.router.navigate(['thank-you']);
        } else {
          if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
            this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
          } else {
            this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
          }
        }
        this.global.globalLoaderMessage();
      }
    }, error => {
      if (res.result.stepInfo.isEKYCComplete === 1) {
        this.router.navigate(['thank-you']);
      } else {
        if (this.global.checkForMFAPP(res?.result?.stepInfo)) {
          this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
        } else {
          this.global.redirectToLastVerifiedPageGold(res?.result?.stepInfo);
        }
      }
      this.global.globalLoaderMessage();
    })
  }

  /**
   * Open modal popup
   * @param forWhat: open modal popup 
   * @param checkingData: recursively check
   */
  openModalPopup(forWhat: any = '', checkingData: any = '') {
    const obj = {
      // email: this.registerform.value.email,
      mobile_number: this.registerform.value.mobilenumber,
      pan_username: this.registerform.value.pan_username.toUpperCase(),
      dob: this.registerform.value.dob,
    };
    if (!this.cookieService.get('email')) {
      obj['email'] = this.registerform.value.email;
    }

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
            this.submitData(obj);
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
          this.submitData(obj);
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
    this.subscribeGetConfigFlowData && this.subscribeGetConfigFlowData.unsubscribe();
    this.subscribeConfigInfo && this.subscribeConfigInfo.unsubscribe();
    this.obs && this.obs.unsubscribe();
  }
}
