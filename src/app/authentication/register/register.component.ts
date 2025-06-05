import { Subscription } from 'rxjs';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { AuthenticationService } from '../authentication.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { NgbDatepicker, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { CustomDateParserFormatter, CustomAdapter } from 'src/app/shared/customeAdapter';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialoge.service';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { TestimonialComponent } from 'src/app/shared/testimonial/testimonial.component';
import { SharedModule } from "../../shared/shared.module";
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { CookieService } from 'ngx-cookie-service';
import { CommonLeftportionComponent } from '../common-leftportion/common-leftportion.component';
import { FaqComponent } from 'src/app/shared/faq/faq.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule, PipesModule, TranslateModule, TestimonialComponent, SharedModule, ControlMessagesComponent, FooterComponent, CommonLeftportionComponent, FaqComponent]
  // providers: [
  //   { provide: NgbDateAdapter, useClass: CustomAdapter },
  //   { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  // ]

})
export class RegisterComponent implements OnInit, AfterViewInit {
  @ViewChild('dp') dp: NgbDatepicker;
  @ViewChild("myinput") myInputField: ElementRef;
  @ViewChild('mobileNumberSystemExist') mobileNumberSystemExist: any;
  @ViewChild('mobileNumberSystemExistEKYC') mobileNumberSystemExistEKYC: any;

  env = environment;

  public registerform: UntypedFormGroup;
  idArihantPlus: string;
  code: string;
  rmcode: string;
  subrmcode: string;
  eye_img: any = 'assets/images/eye-close.svg';
  commonConfigFlow: any;
  contentData: any;
  loginInformationText: any;
  faqUrl = `${environment.faqUrl}`;
  referenceSourceQueryParam: any;
  isAvailableRMCODE: boolean;
  obs: Subscription;
  subscribeGetConfigFlowData: Subscription;
  isMobileDevice: boolean;
  loading: boolean;
  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public validate: ValidationService,
    private cookieService: CookieService,
    public authenticationService: AuthenticationService,
    config: NgbDatepickerConfig,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private ngZone: NgZone
  ) {
    const currentDate = new Date();
    config.minDate = { year: 1947, month: 1, day: 1 };
    config.maxDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    config.outsideDays = 'hidden';
    this.ngZone.runOutsideAngular(() => {
      this.obs = this.sharedVarService.getSiteContentData().subscribe((res: any) => {
        this.contentData = res;
      });
    })
  }


  formControlValueChanged() {
    this.registerform.get('pan_username').valueChanges.subscribe(
      (mode: string) => {
        // console.log(mode);
      });
  }

  removeRmCode() {
    this.rmcode = '';
    this.cookieService.delete('rmcode');
  }

  ngOnInit(): void {
    const deleteCookieArray = ['email', 'user_token', 'user_mobile', 'user_auth_token'];
    this.global.deleteMultiCookies(deleteCookieArray);

    // this.cookieService.delete('subrmcode');  // For one week only
    // this.cookieService.delete('rmcode'); // For one week only
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobileDevice = true;
    }
    this.idArihantPlus = '';
    this.cookieService.delete('idArihantPlus');
    // if (this.cookieService.get('idArihantPlus')) {
    //   this.idArihantPlus = this.cookieService.get('idArihantPlus');
    // }
    this.rmcode = '';
    if (this.cookieService.get('rmcode')) {
      this.rmcode = this.cookieService.get('rmcode');
    }
    this.subrmcode = '';
    if (this.cookieService.get('subrmcode')) {
      this.cookieService.delete('rmcode');
      this.subrmcode = this.cookieService.get('subrmcode');
    }
    this.global.globalLoaderMessage();
    window.localStorage.removeItem('rmcode');
    this.route.queryParams.subscribe(params => {
      if (params['ID'] && (params['ID'] === 'arihantplus')) {
        this.subrmcode = '';
        this.rmcode = '';
        this.cookieService.delete('subrmcode');
        this.cookieService.delete('rmcode');
        this.idArihantPlus = 'arihantplus';
        this.cookieService.set('idArihantPlus', this.idArihantPlus, this.global.getCookieExpiredRMTime());
        window.localStorage.setItem('idArihantPlus', this.rmcode);
      }

      if (params['rmcode']) {
        this.subrmcode = '';
        this.cookieService.delete('subrmcode');
        this.rmcode = params['rmcode'];
        this.cookieService.set('rmcode', this.rmcode, this.global.getCookieExpiredRMTime());
        // window.localStorage.setItem('rmcode', this.rmcode);
      }
      if (params['subrmcode']) {
        this.rmcode = '';
        this.cookieService.delete('rmcode');
        this.subrmcode = params['subrmcode'];
        this.cookieService.set('subrmcode', this.subrmcode, this.global.getCookieExpiredRMTime());
        // this.cookieService.delete('rmcode');
        // window.localStorage.setItem('rmcode', this.rmcode);
      }
      if (params['code']) {
        this.code = params['code'];
      }
      if (params['referencesource']) {
        this.referenceSourceQueryParam = params['referencesource'];
      }
      window.localStorage.setItem('mfapp', '0');
      if (params['mfapp'] === true || params['mfapp'] === 'true') {
        window.localStorage.setItem('mfapp', '1');
      }
    });

    this.setMobileValidateTheForm();
    this.subscribeGetConfigFlowData = this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
        this.isAvailableRMCODE = false;
        const rmcodeArray = this.commonConfigFlow?.rm_code;
        if (rmcodeArray?.length > 0 && this.rmcode) {
          if (rmcodeArray.find(e => e.toString() === this.rmcode?.toString())) {
            this.isAvailableRMCODE = true;
          }
        }
        if (this.commonConfigFlow.login_type === 'Mobile_OTP') {
          this.setMobileValidateTheForm();
        } else if (this.commonConfigFlow.login_type === 'Email_Password') {
          this.setValidateTheForm();
        } else if (this.commonConfigFlow.login_type === 'Pan_DOB') {
          this.setPanDOBValidateTheForm();
        }
      } else {
        this.setConfigFlow();
      }
    });

    this.sharedVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.loginInformationText = data?.login_information_text;
      }
    });

  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.myInputField) {
        this.myInputField.nativeElement.focus();
      }
    }, 1000);
    setTimeout(() => {
      this.global.logEventUserExperior("Landing on ekyc register page");
    }, 2000);
  }


  get password() { return this.registerform.get('password'); }

  current_password(value) {
    const input = document.getElementById(value);
    if (input.getAttribute('type') === 'password') {
      input.setAttribute('type', 'text');
      (<HTMLInputElement>document.getElementById(value + 'img')).setAttribute('src', 'assets/images/eye-close.svg');
    } else {
      input.setAttribute('type', 'password');
      (<HTMLInputElement>document.getElementById(value + 'img')).setAttribute('src', 'assets/images/eye.svg');
    }
  }

  /**
   * Set validation the form
   */
  setValidateTheForm() {
    const dob = new UntypedFormControl('', [ValidationService.required, ValidationService.dobValidator]);
    this.registerform = this.fb.group({
      email: ['', Validators.compose([Validators.required, ValidationService.emailValidator])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(25)])],
    });

    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        const email = params['email'];
        this.registerform.get('email').setValue(email);;
      }

    });
  }

  /**
   * Set Mobile validation form for mobile OTP login type
   */
  setMobileValidateTheForm() {
    this.registerform = this.fb.group({
      // join_with: [true, Validators.requiredTrue],
      mobilenumber: ['', Validators.compose([ValidationService.mobileNumberCustomeValidator, Validators.maxLength(10), ValidationService.mobileNumberFIXSTARTDigitValidator])]
    });
  }

  /**
   * Set validation the form for PAN DOB login type
   */
  setPanDOBValidateTheForm() {
    this.registerform = this.fb.group({
      pan_username: ['', Validators.compose([ValidationService.required, Validators.maxLength(10), ValidationService.panValidator])],
      dob: ['', Validators.compose([ValidationService.required, ValidationService.dobValidator])],
    });
  }


  /**
   * Set Config Flow into shared variable
   */
  setConfigFlow() {
    const obj = { 'login_type': environment.login_type }; // login_type =  Mobile_OTP  || Email_Password || Pan_DOB

    this.global.getConfigureFlow(obj).subscribe((res: any) => {
      if (res.success) {
        this.sharedVarService.setConfigFlowData(res.result);
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

  onSubmit() {
    if (this.registerform.valid) {
      // if (!this.registerform.get('join_with').value) {
      //   this.registerform.setValue['join_with']
      //   this.global.errorToastr('PLEASE_ACCEPT_JOIN_WITH');
      //   return;
      // }
      const obj = {
        email: this.registerform.value.email
        // pan_username: this.registerform.value.pan_username.toUpperCase(),
        // dob: this.registerform.value.dob,
      };
      let paramObj: any = {};
      if (this.rmcode) {
        paramObj['rmcode'] = this.rmcode;
      } else if (this.cookieService.get('rmcode')) {
        this.rmcode = this.cookieService.get('rmcode');
        paramObj['rmcode'] = this.rmcode;
      }
      if (this.subrmcode) {
        paramObj['subrmcode'] = this.subrmcode;
      } else if (this.cookieService.get('subrmcode')) {
        this.subrmcode = this.cookieService.get('subrmcode');
        paramObj['subrmcode'] = this.subrmcode;
      }
      if (this.referenceSourceQueryParam) {
        paramObj['referencesource'] = this.referenceSourceQueryParam;
      }
      if (this.code) {
        obj['code'] = this.code;
      }
      paramObj['login_type'] = this.commonConfigFlow.login_type;
      this.route.queryParams.subscribe(params => {
        if (params['utm_source']) {
          paramObj['utm_source'] = params['utm_source'];
        }
        if (params['utm_medium']) {
          paramObj['utm_medium'] = params['utm_medium'];
        }
        if (params['utm_campaign']) {
          paramObj['utm_campaign'] = params['utm_campaign'];
        }
        if (params['utm_content']) {
          paramObj['utm_content'] = params['utm_content'];
        }
        if (params['utm_term']) {
          paramObj['utm_term'] = params['utm_term'];
        }
        if (params['sub_id']) {
          paramObj['sub_id'] = params['sub_id'];
        }
        if (params['click_id']) {
          paramObj['click_id'] = params['click_id'];
        }
        if (params['utm_creative']) {
          paramObj['utm_creative'] = params['utm_creative'];
        }
        if (params['utm_device']) {
          paramObj['utm_device'] = params['utm_device'];
        }
        if (params['utm_adgroup']) {
          paramObj['utm_adgroup'] = params['utm_adgroup'];
        }
        if (params['utm_placement']) {
          paramObj['utm_placement'] = params['utm_placement'];
        }
        this.cookieService.delete('app_id');
        if (params['appInstanceId']) {
          paramObj['app_instance_id'] = params['appInstanceId'];
          this.cookieService.set('app_id', paramObj['app_instance_id']);
        }
        if (params['promotionalPlan']) {
          paramObj['promotionalPlan'] = params['promotionalPlan'];
        }
        if (params['referralcode']) {
          paramObj['referralcode'] = params['referralcode'];
        }
      });
      paramObj['portal'] = environment.portal;
      if (environment?.isPortalUrlEnable) {
        paramObj['portal_url'] = window.location.href;
      }
      if (this.commonConfigFlow.login_type === 'Mobile_OTP') {
        paramObj['mobile_number'] = this.registerform.value.mobilenumber;
        // paramObj['join_with'] = this.registerform.value.join_with;
        this.commonLoginApi(paramObj);
      } else if (this.commonConfigFlow.login_type === 'Email_Password') { // login type email password
        paramObj['email'] = this.registerform.value.email;
        paramObj['password'] = this.registerform.value.password;
        this.commonLoginApi(paramObj);
      } else if (this.commonConfigFlow.login_type === 'Pan_DOB') { // Login type Pan DOB
        paramObj['pan'] = this.registerform.value.pan_username.toUpperCase();
        paramObj['dob'] = this.registerform.value.dob;

        this.commonLoginApi(paramObj);
      }
    } else {
      this.validate.validateAllFormFields(this.registerform);
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
    }
  }

  /**
   * Common login function on frist step
   * @param paramObj 
   */
  commonLoginApi(paramObj: any) {
    let mfapp = '0';
    if (window.localStorage.getItem('mfapp')) {
      mfapp = window.localStorage.getItem('mfapp');
    }
    paramObj['mfapp'] = mfapp;

    this.authenticationService.commonLoginApi(paramObj).subscribe((res: any) => {
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
          'event': 'mobile_get_otp’',
          'Page_Location': this.router.url.split('?')[0],
          'Page_referrer': this.global?.previousUrl,
          'CTA_text': 'Continue',
          'FormID': 'form id',
          'user_id': `mobile_submit_${this.registerform.value.mobilenumber}`,
          'UTM_source': utmSource ? utmSource : '',
          'UTM_medium': utmMedium ? utmMedium : '',
        });
        /************************ GA TAG PUSH : STOP ********************/
        this.global.logEventUserExperior("Submitted Mobile Number");

        if (res.result) {
          if (res?.result?.token) {
            // this.cookieService.set('user_auth_token', res.result.token);
            this.global.setCookieAuthUserToken(res.result.token);
          }
          if (this.commonConfigFlow?.isEmailVerificationRequired && !res?.result?.config_info?.isEmailVerified && this.commonConfigFlow.login_type === 'Email_Password') {
            if (res?.result?.SSO) {
              window.location.href = environment.googleSignUpUrl;
            } else {
              this.openModalPopup('emailVerification'); return;
            }
          } else {
            if (res?.result?.authTypeSSO === 1) {
              window.location.href = environment.googleSignUpUrl;
            }
            if (this.commonConfigFlow.step2 === 'email') {
              if (res.result.token) {
                // this.cookieService.set('user_auth_token', res.result.token);
                this.global.setCookieAuthUserToken(res.result.token);
              }
              if (res.result.config_info) {
                this.getCheckConfigInfo(res.result.config_info, res);
              }
              // this.router.navigate(['register-email']);
            } else if (this.commonConfigFlow.step2 === 'otp') {
              if (res?.message) {
                this.global.successToastr(res.message);
              }
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
              this.router.navigate(['mobile-verify']);
            } else if (this.commonConfigFlow.step2 === 'mobile') {
              if (res.result.token) {
                // this.cookieService.set('user_auth_token', res.result.token);
                this.global.setCookieAuthUserToken(res.result.token);
              }
              if (res.result.config_info) {
                this.getCheckConfigInfo(res.result.config_info, res);
              }
              // this.router.navigate(['register-mobile-number']);
            } else if (this.commonConfigFlow.step2 === 'pan_dob') {
              if (res.result.token) {
                // this.cookieService.set('user_auth_token', res.result.token);
                this.global.setCookieAuthUserToken(res.result.token);
              }
              if (res.result.config_info) {
                this.getCheckConfigInfo(res.result.config_info, res);
              }
            }
          }

          // this.cookieService.set('user_mobile', res.result.mobile_number, this.global.getCookieExpiredTime());
        } else {
          this.loginAuthentication(res);
        }
      } else {
        if (res?.result?.arihant_system) {
          this.mobileExistInSystem(this.registerform.value.mobilenumber);
        } else if (res?.result?.isMobileExistInArihantPlus && !res?.result?.isMobileExistInArihantCapital) {// mobile exist in arihant plus
          this.mobileExistInSystemEKYC(this.registerform.value.mobilenumber);
        } else if (!res?.result?.isMobileExistInArihantPlus && res?.result?.isMobileExistInArihantCapital) { // mobile exist in arihant capital
          this.mobileExistInSystemEKYCForArihantplus(this.registerform.value.mobilenumber);
        } else if (res.message) {
          this.global.errorToastr(res.message);
        }
      }
    }, (error: HttpErrorResponse) => {
      if (error.status === 400) {
        this.router.navigate(['/welcome']);
      }
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

  // get password() { return this.registerform.get('password'); }

  /**
   * User move to login directly if he/she already registered with PAN 
   * @param obj 
   */
  async loginAuthentication(res: any) {
    // if (res?.result?.authType === 1) {
    //   this.redirectToLogin(res);
    //   window.location.href = environment.appleSignupUrl;
    // } else 

    if (res?.result?.authType === 2) { // Facebook login
      this.redirectToLogin(res);
      window.location.href = environment.facebookSignupUrl;
    } else if (res?.result?.authType === 3 || res?.result?.authTypeSSO === 1) { // Google login
      this.redirectToLogin(res);
      window.location.href = environment.googleSignUpUrl;
    } else { // manual login

      this.global.deleteMultiCookies(['login_user_mobile', 'login_user_token', 'otpMaxTime', 'email', 'mfapp']);
      // this.cookieService.set('user_auth_token', res.result.token);
      this.global.setCookieAuthUserToken(res.result.token);
      this.global.successToastr(res.message);
      if (res?.result?.ucc) {
        const uccToken = res?.result?.ucc_token;
        const redirectUrl = `${res?.result?.ucc_redirection_url}/${uccToken}`;
        window.location.href = redirectUrl;
      } else {
        if (res?.result?.stepInfo) {
          if (res?.result?.stepInfo?.egoldkyccomplete) {
            const GolpAppToken = res?.result?.token;
            const redirectUrl = `${environment.golapp}/loginWithToken/${GolpAppToken}`;
            window.location.href = redirectUrl;
          } else {
            this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
            if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
              await this.verifyPanDetails();
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
        }
        this.router.navigate(['welcome']);
      }


      // if (res?.message) {
      //   this.global.successToastr(res.message);
      // }
      // this.cookieService.set('email', this.registerform.value.email, this.global.getCookieExpiredTime());
      // this.cookieService.set('login_user_mobile', res.result.mobileNumber, this.global.getCookieExpiredTime());
      // this.cookieService.set('login_user_token', res.result.token, this.global.getCookieExpiredTime());
      // if (res.result.otpMaxTime) {
      //   let newDateObj: any = new Date();
      //   newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(res.result.otpMaxTime) * 1000)); // for 10 minute
      //   this.cookieService.set('otpMaxTime', newDateObj, this.global.getCookieExpiredTime());
      // }
      // this.router.navigate(['login-verification']);
    }
  }

  verifyPanDetails() {
    this.authenticationService.verifyPanDetailsByKRA().subscribe((res: any) => {
      if (res.success) {
        this.sharedVarService.setStepsInfo(res.result);
        return true;
      } else {
        return true;
      }
    });
  }

  redirectToLogin(res) {
    if (res?.message) {
      this.global.successToastr(res.message);
    }
    if (res?.result?.mobileNumber) {
      this.cookieService.set('login_user_mobile', res.result.mobileNumber, this.global.getCookieExpiredTime());
    }
    if (res?.result?.token) {
      this.cookieService.set('login_user_token', res.result.token, this.global.getCookieExpiredTime());
    }
    if (res?.result?.otpMaxTime) {
      let newDateObj: any = new Date();
      newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(res.result.otpMaxTime) * 1000)); // for 10 minute
      this.cookieService.set('otpMaxTime', newDateObj, this.global.getCookieExpiredTime());
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

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  /**
  * Mobile Number Already Exist Modal popup
  */
  mobileNumberExist: any;
  mobileExistInSystem(mobile: any) {
    this.mobileNumberExist = mobile;
    this.modalService.open(this.mobileNumberSystemExist, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => {
      if (result === 'ok') {
        window.location.href = `${environment.clientLogin}`;
      }
    });
  }

  existDetails: any;
  mobileExistInSystemEKYC(mobile: any) {
    this.mobileNumberExist = mobile;
    this.existDetails = { 'lable': 'Arihant Plus EKYC system', 'link': 'https://signup.arihantplus.com', }
    this.modalService.open(this.mobileNumberSystemExistEKYC, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => {
      if (result === 'ok') {
        window.location.href = `${environment.ekycArihantPlusLogin}`;
      }
    });
  }

  mobileExistInSystemEKYCForArihantplus(mobile: any) {
    this.mobileNumberExist = mobile;
    this.existDetails = { 'lable': 'Arihant Capital EKYC system', 'link': 'https://ekyc.arihantcapital.com', }
    this.modalService.open(this.mobileNumberSystemExistEKYC, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => {
      if (result === 'ok') {
        window.location.href = `${environment.ekycArihantCapitalLogin}`;
      }
    });
  }

  resetForm() {
    this.registerform.reset();
    this.setMobileValidateTheForm();
    this.modalService.dismissAll();
  }

  whatsAppLink() {
    const url = `https://api.whatsapp.com/send?phone=917314217003`;
    window.open(url, '_blank');
    // window.location.href = 'https://api.whatsapp.com/send?phone=917314217003';
  }

  ngOnDestroy(): void {
    // console.log('test unsubscribe', this.contentData);
    this.contentData;
    this.obs && this.obs.unsubscribe();
    this.subscribeGetConfigFlowData && this.subscribeGetConfigFlowData.unsubscribe();
  }



}
