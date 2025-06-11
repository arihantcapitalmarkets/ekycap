import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable, BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SharedVarService } from './sharedVar.service';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
// import { CookiesService } from "@ngx-utils/cookies";
import { AuthenticationService } from '../authentication/authentication.service';
import { CookieService } from 'ngx-cookie-service';
declare let window: any;
declare let ue: any;

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  globalUserExperiorSet: boolean;
  baseUrl = environment.baseUrl + 'api/';
  isLogin = false;
  isLoading = false;
  language: any = 'en';
  changableImages: any;
  eye_img: any = 'assets/images/eye-close.svg';
  companyLogoUrl: any = environment.logo_url;
  arihantPlusLogoUrl: any = 'assets/images/logo-arihant-plus.svg';
  companyLogoUrlWT: any = 'assets/images/logo-arihant-plus.svg';
  live_register_page: any = environment.login_redirect_page;
  explore_web_url: any = environment.explore_web_url;
  mutualfund_web_url: any = environment.mutualfund_web_url;
  aboutus_web_url: any = environment.aboutus_web_url;
  home_url: any = environment.home_url;
  goals_url: any = environment.goals_url;
  calculators_url: any = environment.calculators_url;
  culture_url: any = environment.culture_url;
  career_url: any = environment.career_url;
  googleSignUpUrl: any = environment.googleSignUpUrl;
  facebookSignupUrl: any = environment.facebookSignupUrl;
  appleSignUpUrl: any = environment.appleSignupUrl;
  blogUrl: any = environment.blogUrl;
  faqUrl: any = environment.faq_url;
  nfoUrl: any = environment.nfo_url;
  commonConfigFlow: any;
  loaderText = 'Good things take time.. Hold on..';
  clientLogin: any = environment.clientLogin;
  androidLink: any = environment.androidLink;
  iosLink: any = environment.iosLink;
  isMobileDevice: boolean;
  mobileType: string = '';
  previousUrl: any;
  selfieMode: string = 'not_hyperverge';
  AINEXTSelfieMode: boolean = environment.aiNextSelfiMode;
  isOwnPhotoCapture: string = environment.isOwnPhotoCapture;
  ddpiConsentsArray = [];
  isDDPIConsentRequired = environment.isDDPIConsentRequired;
  accountStatementRequiredArray = [{
    "id": 551,
    "name": "As_per_SEBI_Regulation",
    "is_required": false,
    "is_disable": true,
    "selected": false,
    "description": "As per SEBI Regulation",
  }, {
    "id": 552,
    "name": "Daily",
    "is_required": false,
    "is_disable": true,
    "selected": false,
    "description": "Daily",
  }, {
    "id": 553,
    "name": "Weekly",
    "is_required": false,
    "is_disable": true,
    "selected": false,
    "description": "Weekly",
  }, {
    "id": 554,
    "name": "Fortnightly",
    "is_required": false,
    "is_disable": true,
    "selected": false,
    "description": "Fortnightly",
  }, {
    "id": 555,
    "name": "Monthly",
    "is_required": true,
    "is_disable": false,
    "selected": true,
    "description": "Monthly",
  }];

  constructor(
    private router: Router,
    private http: HttpClient,
    public translate: TranslateService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private sharedVarService: SharedVarService,
    private authenticationService: AuthenticationService
  ) {
    this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      }
    });
    this.sharedVarService.getUserExperiorWorks().subscribe((res: any) => {
      if (res) {
        this.globalUserExperiorSet = res;
      }
    });

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobileDevice = true;
      this.detectDevice();
    }


    this.ddpiConsentsArray = [
      {
        "id": 1,
        "name": "transfer_security",
        "is_required": false,
        "description": "Transfer of securities held in the beneficial owner accounts of the client towards Stock Exchange related deliveries / settlement obligations arising out of trades executed by clients on the Stock Exchange through the same stock broker.",
        "selected": true,
        "is_disable": false
      },
      {
        "id": 2,
        "name": "Pledging",
        "is_required": false,
        "description": "Pledging / re-pledging of securities in favour of trading member (TM) / clearing member (CM) for the purpose of meeting margin requirements of the clients in connection with the trades executed by the clients on the Stock Exchange.",
        "selected": true,
        "is_disable": false
      },
      {
        "id": 3,
        "name": "mutual_fund_transactions",
        "is_required": false,
        "description": "Mutual Fund transactions being executed on stock exchange order entry platforms and which shall be in compliance with SEBI circulars SEBI/HO/IMD/IMD-I DOF5/P/CIR/2021/634 dated October 04, 2021, SEBI/HO/IMD/IMD-I DOF5/P/CIR/2021/635 dated October 04, 2021 and SEBI/HO/IMD/IMD-I DOF5/P/CIR/2022/29 dated March 15, 2022 or any other circular which may be issue d in this regard.",
        "selected": true,
        "is_disable": false
      },
      {
        "id": 4,
        "name": "tendring_shares",
        "is_required": false,
        "description": "Tendering shares in open offers which shall be in compliance with SEBI circular SEBI/HO/CFD/DCR-III/CIR/P/2021/615 dated August 13, 2021 or any other circular which may be issued in this regard.",
        "selected": true,
        "is_disable": false
      }];
  }

  detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
      this.mobileType = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      this.mobileType = 'iOS';
    } else {
      this.mobileType = 'Other';
    }
  }


  whatsAppRedirect() {
    window.location.href = `https://api.whatsapp.com/send?phone=7869755386`;
  }

  setCookieAuthUserToken(accessToken: any) {
    if (environment.setAccessTokenWithExpireTime) {
      this.cookie.set('user_auth_token', accessToken, this.getCookieExpiredAuthTokenTime());
    } else {
      this.cookie.set('user_auth_token', accessToken);
    }
  }

  setRefreshToken(refreshToken) {
    if (refreshToken) {
      localStorage.setItem('ref_token', JSON.stringify(refreshToken));
      if (environment.isRefreshTokenCheck) {
        this.setAccessTokenExpiry();
      }
    }
  }

  setAccessTokenExpiry() {
    let newDateObj: any = new Date();
    newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(environment.configExpAccessToken) * 60 * 1000)); // for 1 minute
    this.cookie.set('accessTokenExp', newDateObj, this.getCookieExpiredTimeAccessToken());
    this.authenticationService.timerOtpExpiryAccessToken();
  }

  /**
  * get expired time or set expired time
  */
  getCookieExpiredTimeAccessToken() {
    const date = new Date();
    date.setTime(date.getTime() + (Number(environment?.getCookieExpiredTimeAccessToken) * 60 * 1000)); // for 1 minute
    // const time = date.getTime() + (60 * 60 * 1); // in hours
    return date;
  }

  clearLocalStorage(inArray: any = '') {
    if (inArray?.length) {
      inArray.map((item) => {
        if (localStorage.getItem(item)) {
          localStorage.removeItem(item);
        }
      })
    } else if (localStorage.getItem('ref_token')) {
      localStorage.removeItem('ref_token');
    } else {
      localStorage.clear();
    }
  }

  getPreiousUrl() {
    this.sharedVarService.getPreviousUrl().subscribe((previousUrl: string) => {
      console.log('previous url: ', previousUrl);
      this.previousUrl = previousUrl;
    });
  }

  /**
   * GAT TAG PUSH / FIREBASE TAG PUSH IF instance id is found on query params 
   * @param eventName 
   */
  setPushToGTM(eventName: any, isInstanceExist: boolean = false, extraObj: any = '') {
    // if (environment.tagManager) {
    //   if (isInstanceExist) {

    //   } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventName);
    // }
    // }
  }


  /**
  * Log Event Set for User Experior Software
  */
  logEventUserExperior(eventName, obj: any = '') {
    if (environment.userExperior && this.globalUserExperiorSet) {
      if (obj) {
        ue.logEvent(eventName, obj);
      } else {
        ue.logEvent(eventName);
      }
    }
  }

  /** set language */
  setLanguage(showToaster: boolean = true) {
    const language = this.cookie.get('language');
    this.language = language;
    this.translate.use(this.language).subscribe(() => {
      if (showToaster) {
        this.toastr.success(this.translate.instant('LANG_CHANGE_SUCC'));
      }
    });
  }

  globalLoaderMessage(text: any = '') {
    this.loaderText = 'Good things take time.. Hold on..';
    if (text) {
      this.loaderText = text;
    }
  }

  globalLoader(isLoading: boolean = false) {
    this.isLoading = isLoading;
  }

  getLocationService(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resp => {
        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      }, error => {
        reject(false);
      })
    })
  }

  /**
   * Delete multiple cookie as per passed array
   */
  deleteMultiCookies(cookieParams: any) {
    cookieParams.map((item: any) => {
      this.cookie.delete(item);
    });
  }
  /**
   * get expired time or set expired time
   */
  getCookieExpiredTime() {
    const date = new Date();
    date.setTime(date.getTime() + (10 * 60 * 1000)); // for 10 minute
    // const time = date.getTime() + (60 * 60 * 1); // in hours
    return date;
  }

  getCookieExpiredAuthTokenTime() {
    const date = new Date();
    date.setTime(date.getTime() + (environment.setAccessTokenExpTime * 60 * 60 * 1000)); // for Hours
    return date;
  }

  getCookieExpiredRMTime() { //7 * 24 * 60 * 60 * 1000 = for 7 days
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // for 7 Days
    return date;
  }

  /**
   * password text or password as per eye icon toggle
   * @param value 
   */
  current_password(value: any = '') {
    const input = document.getElementById(value);
    if (input.getAttribute('type') === 'password') {
      input.setAttribute('type', 'text');
      return (<HTMLInputElement>document.getElementById(value + 'img')).setAttribute('src', 'assets/images/eye.svg');
    } else {
      input.setAttribute('type', 'password');
      return (<HTMLInputElement>document.getElementById(value + 'img')).setAttribute('src', 'assets/images/eye-close.svg');
    }
  }

  /**
   * Success Toastr
   */
  successToastr(message: any, title: any = 'Success') {
    this.toastr.success(this.translate.instant(message), title);
  }

  /**
   * Warning Toastr
   */
  warningToastr(message: any, title: any = 'Warning') {
    this.toastr.warning(this.translate.instant(message), title);
  }

  /**
   * Error Toastr
   */
  errorToastr(message: any, title: any = 'Error') {
    this.toastr.error(this.translate.instant(message), title);
  }

  /**
   * Income Range array
   */
  trandingAccountTypeArray() {
    return [{ id: 1, name: 'Equity' }, { id: 2, name: 'Mutual Funds' }, { id: 3, name: 'Future & Options' }, { id: 4, name: 'Initial Public Offerings' }];
  }

  /**
   * Converimage from binary to blob image
   * @param imageAsDataUrl 
   */
  appendFileAndSubmit(imageAsDataUrl: any) {
    // imageAsDataUrl = 'data:image/gif;base64,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';
    const ImageURL = imageAsDataUrl;
    const block = ImageURL.split(";");
    const contentType = block[0].split(":")[1];// In this case "image/gif"
    const realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."
    const blob = this.b64toBlob(realData, contentType);
    return blob;
  }

  b64toBlob(b64Data, contentType, sliceSize = 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  /**
   * Scroll up at zero level of window
   */
  onActivate() {
    window.scroll(0, 0);
  }

  /**
   * Redirect to page
   * @param redirectPage 
   */
  redirectToPage(type: string) {
    this.onActivate();
    this.sharedVarService.setActivePageInfoValue(type);
    this.router.navigate([type]);
  }

  /**
   * Checking for mfapp or gold app
   * @param verfiedSteps 
   * @returns 
   */
  checkForMFAPP(verfiedSteps: any) {
    if (verfiedSteps?.mf_app) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * GOLD APP
   * @param verfiedSteps 
   */
  redirectToLastVerifiedPageGold(verfiedSteps: any) { // For GOLD APP
    // if (!verfiedSteps?.isAadharVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('welcome');
    //   this.router.navigate(['welcome']);
    // } else 
    if (!verfiedSteps?.isPanVerified && !verfiedSteps?.ispersonalDetailsVerified && !verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('address-details');
      this.router.navigate(['address-details']);
    }
    // else if (!verfiedSteps?.isAddressVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('personal-details');
    //   this.router.navigate(['personal-details']);
    // } else if (!verfiedSteps?.isSegmentVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('address-details');
    //   this.router.navigate(['address-details']);
    // }
    // else if (!verfiedSteps?.isTrandingAccountType) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('segment-brokerage');
    //   this.router.navigate(['segment-brokerage']);
    // } else if (!verfiedSteps?.isNominatedVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('trading-account');
    //   this.router.navigate(['trading-account']);
    // } 
    else if (verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('segment-brokerage');
      this.router.navigate(['bank-account-details']);
    }
    else {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('documents-upload');
      this.router.navigate(['bank-account-details']);
    }
    // else if (!verfiedSteps?.isBankAccountVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('trading-account-type');
    //   this.router.navigate(['trading-account-type']);
    // }
  }

  /**
   * MF APP
   * @param verfiedSteps 
   */
  redirectToLastVerifiedPage(verfiedSteps: any, commonConfigFlow: any = '') { // For MF APP
    if (commonConfigFlow) {
      this.commonConfigFlow = commonConfigFlow;
    }
    // if (!verfiedSteps?.isAadharVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('welcome');
    //   this.router.navigate(['welcome']);
    // } else 
    if (!verfiedSteps?.isPanVerified && !verfiedSteps?.ispersonalDetailsVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('welcome');
      this.router.navigate(['welcome']);
    } else if (!verfiedSteps?.isAddressVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('personal-details');
      this.router.navigate(['personal-details']);
    }
    // else if (!verfiedSteps?.isSegmentVerified && !this.commonConfigFlow?.isSegmentSkip) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('address-details');
    //   this.router.navigate(['address-details']);
    // }
    else if (!verfiedSteps?.isNominatedVerified) {
      this.onActivate();
      if (!verfiedSteps?.isNomineeSkiped) {
        this.sharedVarService.setActivePageInfoValue('nominee-details');
        this.router.navigate(['nominee-details']);
      } else {
        this.sharedVarService.setActivePageInfoValue('nominee-details');
        this.router.navigate(['personal-details']);
      }
    } else if (!verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      // this.sharedVarService.setActivePageInfoValue('nominee-details');
      // this.router.navigate(['nominee-details']);
      if (verfiedSteps?.isNomineeSkiped) {
        this.sharedVarService.setActivePageInfoValue('personal-details');
        this.router.navigate(['personal-details']);
      } else {
        this.sharedVarService.setActivePageInfoValue('nominee-details');
        this.router.navigate(['nominee-details']);
      }
    } else if (!verfiedSteps?.isDeclaration) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('bank-account-details');
      this.router.navigate(['bank-account-details']);
    } else if (!verfiedSteps?.isSignaturePhotographUploaded || (!verfiedSteps?.isPaymentCompleted && verfiedSteps?.isPaymentRequired)) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('declarations');
      this.router.navigate(['declarations']);
    } else if (!verfiedSteps?.isDocumentUploaded) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('signature-photograph');
      this.router.navigate(['signature-photograph']);
    } else {
      if (this.commonConfigFlow.isEsignRequired) {
        setTimeout(async () => {
          if (verfiedSteps && verfiedSteps?.isApproved) {
            this.checkIsApplicationApproveWithoutMessage(verfiedSteps); return;
          }
        }, 500);
        this.onActivate();
        this.sharedVarService.setActivePageInfoValue('esign-confirm');
        this.router.navigate(['esign-confirm']);
      } else {
        this.onActivate();
        this.sharedVarService.setActivePageInfoValue('documents-upload');
        this.router.navigate(['documents-upload']);
      }
    }
    // else if (!verfiedSteps?.isBankAccountVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('trading-account-type');
    //   this.router.navigate(['trading-account-type']);
    // }
  }

  redirectTothePage(pageName: string) {
    this.onActivate();
    this.sharedVarService.setActivePageInfoValue(pageName);
    this.router.navigate([pageName]);
  }

  /**
   * Move to first screen of remain page
   * @param verfiedSteps 
   */
  redirectToFirstUnVerifiedPage(verfiedSteps: any, commonConfigFlow: any = '') { // For MF APP
    if (commonConfigFlow) {
      this.commonConfigFlow = commonConfigFlow;
    }
    // if (!verfiedSteps?.isAadharVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('welcome');
    //   this.router.navigate(['welcome']);
    // } else 
    if (!verfiedSteps?.isPanVerified && !verfiedSteps?.ispersonalDetailsVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('welcome');
      this.router.navigate(['welcome']);
    } else if (!verfiedSteps?.isAddressVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('personal-details');
      this.router.navigate(['personal-details']);
    } else if (!verfiedSteps?.isNominatedVerified) {
      this.onActivate();
      if (!verfiedSteps?.isNomineeSkiped) {
        this.sharedVarService.setActivePageInfoValue('nominee-details');
        this.router.navigate(['nominee-details']);
      } else {
        this.sharedVarService.setActivePageInfoValue('personal-details');
        this.router.navigate(['personal-details']);
      }
    }
    else if (!verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('bank-account-details');
      this.router.navigate(['bank-account-details']);
    } else if ((!verfiedSteps?.isDeclaration) || (!verfiedSteps?.isPaymentCompleted && verfiedSteps?.isPaymentRequired)) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('declarations');
      this.router.navigate(['declarations']);
    } else if (!verfiedSteps?.isSignaturePhotographUploaded) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('signature-photograph');
      this.router.navigate(['signature-photograph']);
    } else if (!verfiedSteps?.isDocumentUploaded) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('documents-upload');
      this.router.navigate(['documents-upload']);
    } else {
      if (this.commonConfigFlow.isEsignRequired) {
        setTimeout(async () => {
          if (verfiedSteps && verfiedSteps?.isApproved) {
            this.checkIsApplicationApproveWithoutMessage(verfiedSteps); return;
          }
        }, 500);
        this.onActivate();
        this.sharedVarService.setActivePageInfoValue('esign-confirm');
        this.router.navigate(['esign-confirm']);
      } else {
        this.onActivate();
        this.sharedVarService.setActivePageInfoValue('documents-upload');
        this.router.navigate(['documents-upload']);
      }
    }

  }

  /**
   * GOLD APP
   * @param verfiedSteps 
   */
  redirectAfterLoginLastVerifiedPageGOLD(verfiedSteps: any) { // For GOld app
    if (verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('bank-account-details');
      this.router.navigate(['bank-account-details']);
    } else if (verfiedSteps?.isAddressVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('address-details');
      this.router.navigate(['address-details']);
    } else {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('address-details');
      this.router.navigate(['address-details']);
    }
  }

  /**
   * MF APP
   * @param verfiedSteps 
   */
  redirectAfterLoginLastVerifiedPage(verfiedSteps: any) { // For MF app
    // if (!verfiedSteps?.isAadharVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('welcome');
    //   this.router.navigate(['welcome']);
    // } else 
    if (!verfiedSteps?.isEKYCComplete && verfiedSteps?.isDocumentUploaded) {
      if (this.commonConfigFlow.isEsignRequired) {
        this.onActivate();
        this.sharedVarService.setActivePageInfoValue('esign-confirm');
        this.router.navigate(['esign-confirm']);
      } else {
        this.onActivate();
        this.sharedVarService.setActivePageInfoValue('documents-upload');
        this.router.navigate(['documents-upload']);
      }
    } else if (verfiedSteps?.isDocumentUploaded) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('documents-upload');
      this.router.navigate(['documents-upload']);
    } else if (verfiedSteps?.isSignaturePhotographUploaded) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('signature-photograph');
      this.router.navigate(['signature-photograph']);
    } else if (verfiedSteps?.isDeclaration || (verfiedSteps?.isPaymentCompleted && verfiedSteps?.isPaymentRequired)) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('declarations');
      this.router.navigate(['declarations']);
    } else if (verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('bank-account-details');
      this.router.navigate(['bank-account-details']);
    }
    else if (verfiedSteps?.isNominatedVerified) {
      this.onActivate();
      if (!verfiedSteps?.isNomineeSkiped) {
        this.sharedVarService.setActivePageInfoValue('nominee-details');
        this.router.navigate(['nominee-details']);
      } else {
        this.sharedVarService.setActivePageInfoValue('personal-details');
        this.router.navigate(['personal-details']);
      }
    }
    // else if (verfiedSteps?.isTrandingAccountType) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('trading-account');
    //   this.router.navigate(['trading-account']);
    // } 
    else if (verfiedSteps?.isSegmentVerified && !this.commonConfigFlow?.isSegmentSkip) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('segment-brokerage');
      this.router.navigate(['segment-brokerage']);
    }
    // else if (verfiedSteps?.isAddressVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('address-details');
    //   this.router.navigate(['address-details']);
    // } 
    else if (verfiedSteps?.ispersonalDetailsVerified || verfiedSteps?.isAddressVerified) {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('personal-details');
      this.router.navigate(['personal-details']);
    } else {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('welcome');
      this.router.navigate(['welcome']);
    }
    // else if (!verfiedSteps?.isBankAccountVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('trading-account-type');
    //   this.router.navigate(['trading-account-type']);
    // }
  }


  /**
   * Redirect with toastr message (GOLD APP)
   * @param verfiedSteps 
   */
  redirectToLastVerifiedToastrGold(verfiedSteps: any) { // GOLD APP
    if (!verfiedSteps?.isAddressVerified) {
      this.onActivate();
      this.errorToastr(this.translate.instant('verify_address_details'));
      this.sharedVarService.setActivePageInfoValue('address-details');
      this.router.navigate(['address-details']);
    } else if (!verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      this.errorToastr(this.translate.instant('verify_bank_details'));
      this.sharedVarService.setActivePageInfoValue('bank-account-details');
      this.router.navigate(['bank-account-details']);
    } else {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('bank-account-details');
      this.router.navigate(['bank-account-details']);
    }
  }

  /**
   * Redirect with toastr message
   * @param verfiedSteps 
   */
  redirectToLastVerifiedToastr(verfiedSteps: any) {
    // if (!verfiedSteps?.isAadharVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('welcome');
    //   this.router.navigate(['welcome']);
    // } else 
    if (!verfiedSteps?.isPanVerified && !verfiedSteps?.ispersonalDetailsVerified) {
      this.onActivate();
      this.errorToastr(this.translate.instant('Please verify PAN details'));
      this.sharedVarService.setActivePageInfoValue('welcome');
      this.router.navigate(['welcome']);
    } else if (!verfiedSteps?.ispersonalDetailsVerified || !verfiedSteps?.isAddressVerified || !verfiedSteps?.isNominatedVerified) {
      this.onActivate();
      if (!verfiedSteps?.ispersonalDetailsVerified || !verfiedSteps?.isAddressVerified) {
        this.errorToastr(this.translate.instant('verify_personal_details'));
        this.sharedVarService.setActivePageInfoValue('personal-details');
        this.router.navigate(['personal-details']);
      } else if (!verfiedSteps?.isNominatedVerified) {
        this.errorToastr(this.translate.instant('Please_add_nominee_details'));
        if (!verfiedSteps?.isNomineeSkiped) {
          this.sharedVarService.setActivePageInfoValue('nominee-details');
          this.router.navigate(['nominee-details']);
        } else {
          // this.errorToastr(this.translate.instant('Please_add_nominee_details'));
          this.sharedVarService.setActivePageInfoValue('nominee-details');
          this.router.navigate(['personal-details']);
        }
      }
    }
    // else if (!verfiedSteps?.isAddressVerified) {
    //   this.onActivate();
    //   this.errorToastr(this.translate.instant('verify_address_details'));
    //   this.sharedVarService.setActivePageInfoValue('address-details');
    //   this.router.navigate(['address-details']);
    // } else if (!verfiedSteps?.isSegmentVerified && !this.commonConfigFlow?.isSegmentSkip) {
    //   this.onActivate();
    //   this.errorToastr(this.translate.instant('add_segment_brokerage_details'));
    //   this.sharedVarService.setActivePageInfoValue('segment-brokerage');
    //   this.router.navigate(['segment-brokerage']);
    // }
    // else if (!verfiedSteps?.isTrandingAccountType) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('segment-brokerage');
    //   this.router.navigate(['segment-brokerage']);
    // } 
    // else if (!verfiedSteps?.isNominatedVerified) {
    //   this.onActivate();
    //   this.errorToastr(this.translate.instant('Please_add_nominee_details'));
    //   this.sharedVarService.setActivePageInfoValue('nominee-details');
    //   this.router.navigate(['nominee-details']);
    // } 
    else if (!verfiedSteps?.isBankAccountVerified) {
      this.onActivate();
      this.errorToastr(this.translate.instant('verify_bank_details'));
      this.sharedVarService.setActivePageInfoValue('bank-account-details');
      this.router.navigate(['bank-account-details']);
    } else if (!verfiedSteps?.isDeclaration || (!verfiedSteps?.isPaymentCompleted && verfiedSteps?.isPaymentRequired)) {
      if (!verfiedSteps?.isDeclaration) {
        this.errorToastr('Please submit declaration');
      } else if (!verfiedSteps?.isPaymentCompleted && verfiedSteps?.isPaymentRequired) {
        this.errorToastr('Please do payment first');
      }
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('declarations');
      this.router.navigate(['declarations']);
    } else if (!verfiedSteps?.isSignaturePhotographUploaded) {
      this.onActivate();
      this.errorToastr(this.translate.instant('upload_all_documents'));
      this.sharedVarService.setActivePageInfoValue('signature-photograph');
      this.router.navigate(['signature-photograph']);
    } else if (!verfiedSteps?.isDocumentUploaded) {
      this.onActivate();
      this.errorToastr(this.translate.instant('upload_all_documents'));
      this.sharedVarService.setActivePageInfoValue('documents-upload');
      this.router.navigate(['documents-upload']);
    }
    else {
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('esign-confirm');
      this.router.navigate(['esign-confirm']);
    }
    // else if (!verfiedSteps?.isBankAccountVerified) {
    //   this.onActivate();
    //   this.sharedVarService.setActivePageInfoValue('trading-account-type');
    //   this.router.navigate(['trading-account-type']);
    // }
  }

  checkIsApplicationApprove(verfiedSteps: any) {
    if (verfiedSteps?.isApproved) {
      this.warningToastr(this.translate.instant('application_already_approved'));
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('esign-confirm');
      this.router.navigate(['esign-confirm']);
    }
  }

  checkIsApplicationApproveWithoutMessage(verfiedSteps: any) {
    if (verfiedSteps?.isApproved) {
      // this.warningToastr(this.translate.instant('application_already_approved'));
      this.onActivate();
      this.sharedVarService.setActivePageInfoValue('esign-confirm');
      this.router.navigate(['esign-confirm']);
    }
  }

  /**
 * get trading account type
 */
  getTradingAccounts(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `getTradingAccounts`);
  }

  submitQuery(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}saveQuery`, data);
  }

  twoFactorPermision(objParam: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlOfUser}api/updateTwoFactor`, objParam);
  }

  /**
   * get step info
   */
  getStepsInfo(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrlOfUser}api/getStepInfo`);
  }

  getRiskAnalysisQuestions(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}api/getRiskAnalysisQuestion`);
  }

  saveRiskProfile(data: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlOfUser}api/saveRiskAnalysis`, data);
  }

  getRiskProfile(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrlOfUser}api/getRiskAnalysis`);
  }

  generateToken(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}api/generateToken`);
  }

  verifyPanDetails() {
    return this.authenticationService.verifyPanDetailsByKRA().subscribe((res: any) => {
      if (res.success) {
        /************************ GA TAG PUSH : START ********************/
        let utmSource = '';
        let utmMedium = '';
        this.setPushToGTM({
          'event': 'pan_verify_success',
          'Page_Location': this.router.url.split('?')[0],
          'Page_referrer': this.previousUrl,
          'CTA_text': 'Submit',
          'FormID': 'form id',
          'user_id': `pan_verify_success${Math.random()}`,
          'UTM_source': utmSource ? utmSource : '',
          'UTM_medium': utmMedium ? utmMedium : '',
        });
        /************************ GA TAG PUSH : STOP ********************/
        this.sharedVarService.setStepsInfo(res.result);
        return true;
      } else {
        return true;
      }
    }, error => {
      return false;
    });
  }

  verifyRegisterPanDetails() {
    return this.authenticationService.verifyPanDetailsByKRA().subscribe((res: any) => {
      if (res.success) {
        this.sharedVarService.setStepsInfo(res.result);
        return true;
      } else {
        return true;
      }
    }, error => {
      return false;
    });
  }


  /**
   * Set Config Flow into shared variable
   */
  setConfigFlow() {
    const obj = { 'login_type': environment.login_type }; // login_type =  Mobile_OTP  || Email_Password || Pan_DOB
    this.getConfigureFlow(obj).subscribe((res: any) => {
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

  /**
  * Set Config Step info into shared variable
  */
  getConfigStepInfo() {
    this.configInfo().subscribe((res: any) => {
      if (res.success) {
        this.sharedVarService.setConfigStepData(res.result);
      }
    }, error => {
    });
  }

  /**
   * Get configuration of UI from admin setup
   * @param data 
   * @returns 
   */
  getConfigureFlow(data: any = ''): Observable<any> {
    let resultObj: any;
    if (environment.isProduction) {
      resultObj = {
        "success": true,
        "result": {
          "step1": "mobile",
          "step2": "otp",
          "step3": "email",
          "step4": "pan_dob",
          "demat_type": [
            "3",
            "5"
          ],
          "isEmailVerificationRequired": false,
          "isOTPVerificationRequired": true,
          "isNSDLVerificationRequired": true,
          "isKRAVerificationRequired": false,
          "isKRACompulsory": false,
          "isSegmentSkip": true,
          "isEsignRequired": true,
          "isAdminApprovalNeedForLD": true,
          "nomineeProof": [
            // {
            //   "id": "01",
            //   "name": "Photograph and Signature",
            //   "required": false
            // },
            {
              "id": "02",
              "name": "PAN",
              "label": "PAN Number",
              "required": true
            },
            {
              "id": "03",
              "name": "Aadhaar",
              "label": "Aadhar Number (Enter Valid last 4 digits of Aadhaar card number)",
              "required": true
            },
            // {
            //   "id": "04",
            //   "name": "Proof of Identity.",
            //   "required": false
            // },
            // {
            //   "id": "05",
            //   "name": "Demat Account ID",
            //   "required": true
            // }
            {
              "id": "06",
              "name": "Driving Licence",
              "label": "Driving Licence Number",
              "required": true
            },
            {
              "id": "07",
              "name": "Passport",
              "label": "Passport Number",
              "required": true
            }
          ],
          "esign_provider": "NSDL",
          "login_type": "Mobile_OTP"
        }
      };
    } else {
      resultObj = {
        "success": true,
        "result": {
          "step1": "mobile",
          "step2": "otp",
          "step3": "email",
          "step4": "pan_dob",
          "isEmailVerificationRequired": false,
          "isOTPVerificationRequired": true,
          "isNSDLVerificationRequired": true,
          "isKRAVerificationRequired": false,
          "isKRACompulsory": false,
          "isSegmentSkip": true,
          "isEsignRequired": true,
          "isAdminApprovalNeedForLD": true,
          "nomineeProof": [
            // {
            //   "id": "01",
            //   "name": "Photograph and Signature",
            //   "required": false
            // },
            {
              "id": "02",
              "name": "PAN",
              "label": "PAN Number",
              "required": true
            },
            {
              "id": "03",
              "name": "Aadhaar",
              "label": "Aadhar Number (Enter Valid last 4 digits of Aadhaar card number)",
              "required": true
            },
            // {
            //   "id": "04",
            //   "name": "Proof of Identity.",
            //   "required": false
            // },
            // {
            //   "id": "05",
            //   "name": "Demat Account ID",
            //   "required": true
            // }
            {
              "id": "06",
              "name": "Driving Licence",
              "label": "Driving Licence Number",
              "required": true
            },
            {
              "id": "07",
              "name": "Passport",
              "label": "Passport Number",
              "required": true
            }
          ],
          "demat_type": [
            {
              "lable": "NSDL",
              "id": "3"
            },
            {
              "lable": "CDSL",
              "id": "5"
            }
          ],
          "rm_code": [
            "1002",
            "105",
            "343"
          ],
          "esign_provider": "LEGALITY",
          // "esign_provider": "NSDL",
          "login_type": "Mobile_OTP"
        }
      };
    }
    return of(resultObj);

    // return this.http.post<any>(`${environment.baseUrl}api/getConfiguration`, data);
  }

  getSiteContent(): Observable<any> {
    let resultObj: any;
    if (environment.production) {
      resultObj = {
        "success": true,
        "result": {
          "_id": "61caf57391dc9100098e3076",
          "username_primary_text": "",
          "username_secondary_text": "",
          "username_title": "",
          "username_sub_text": "",
          "mobile_primary_text": "Put your money to work!",
          "mobile_secondary_text": "Open a demat & trading account for free, and start investing in stocks, IPOs and ETFs, or trade in F&O! Zero paperwork, and get started in just 7 minutes.",
          "mobile_title": "Trading with India’s most trusted broker, got even better!",
          "mobile_sub_text": "Trade equities, futures, options, indices, ETFs on our all new mobile app ArihantPlus with superior performance & really easy user experience.",
          "email_primary_text": "",
          "email_secondary_text": "One account, unlimited financial opportunity get started now\n(In just 10 minutes)",
          "email_title": "What’s your email ID?",
          "email_sub_text": "Email verification is mandatory",
          "pan_dob_primary_text": "A tested & trusted platform for investing",
          "pan_dob_secondary_text": "Welcome to the club! Let’s be the everyday partner in understanding better ways to invest and Arihant capital together.",
          "pan_dob_title": "Basic details",
          "pan_dob_sub_text": "PAN is compulsory for investing in India",
          "welcome_text": "The objective of KYC guidelines is to prevent your account from being used, by unauthorized users.\n\nIt also enables us to understand your financial dealings better and will help us serve & manage your risk profile better.",
          "kra_digilocker_text": "Let us help you to get registered even faster. Use your DigiLocker account and use the already verified documents such as Aadhaar, PAN, DL, etc. to complete your KYC form.",
          "non_kra_manual_text": "Your information is secure; we use bank grade security.",
          "id_welcome_message": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1645770779517_id_welcome_message.png",
          "id_aadhaar_details": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1644562897085_id_aadhaar_details.png",
          "id_personal_details": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691061_id_personal_details.png",
          "id_address_details": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1642759463634_id_address_details.png",
          "id_segment_details": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691309_id_segment_details.png",
          "id_nominee_details": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691474_id_nominee_details.png",
          "id_bank_details": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691612_id_bank_details.png",
          "__v": 0,
          "data": "{\"thank_you_content\":\"\",\"welcome_content\":\"<h3>You are just a few steps away from making your first trade!</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>Good news! Some details are pre-filled from KRA, to make your journey a breeze</p>\\n\",\"welcome_content_digilocker\":\"<p>&nbsp;</p>\\n<quillbot-extension-portal></quillbot-extension-portal>\",\"welcome_KRA_DIGILOCKER_verified\":\"<h3>You are just a few steps away from making your first trade!</h3>\\n\",\"personal_details_content\":\"<h3>While we have you, we&rsquo;d love to know you better!</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>Lets jump through the process by filling in the following details (mandatory). To make the process easier, we&rsquo;ve pre-filled &amp; verified some information from your PAN and DigiLocker as provided by you.</p>\\n\",\"address_details_content\":\"<h3>Please validate your address.</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>For your convenience, we&rsquo;ve fetched this information from your PAN and DigiLocker as provided by you.</p>\\n\",\"nominee_details_content\":\"<h3>Nominee Details</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>It&rsquo;s always a good practice to nominate someone, in case you are not around.</p>\\n\",\"bank_details_content\":\"<h3>Bank Details</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>Make sure you add the bank account that&rsquo;s in your name and from which you will transact funds for trading.</p>\\n\",\"confirm_esign_content\":\"<h3>Lastly, let&#39;s e-Sign your application!</h3>\\n\\n<p><span style=\\\"color:#202124\\\">eSign your application using Aadhar OTP.<br />\\n<br />\\nYou will now be redirected to the NSDL website.</span></p>\\n\\n<p><span style=\\\"color:#202124\\\">In case your mobile number is not linked to Aadhar or if you are facing any problem during the e-sign process, please contact our customer support desk.</span></p>\\n\\n<p>&nbsp;</p>\\n\\n<p>&nbsp;</p>\\n\",\"nominee_document_upload_note\":\"<p><b>Please Note:</b>For each nominee you add here, you will have to upload a valid address proof in the upcoming step entitled as &ldquo;Documents Upload&rdquo;. Please note that in case any nominee is a minor, their guardian&#39;s address proof has to be submitted.</p>\\n\",\"security_note_bank_page\":\"Don’t worry! Your information is secure with us, we use bank grade security.\",\"transfer_credit_note\":\"\",\"need_help_popup_text\":\"<p>Tell us what happened and we would love to help you out!</p>\\n\",\"logout_popup_text\":\"<p>Are you sure you want to go?</p>\\n\\n<p><br />\\nDon&rsquo;t worry, your information is saved. You can come back to complete it anytime.</p>\\n\",\"login_information_text\":\"<p>By submitting your contact details, you authorise Arihant Capital Markets Ltd to call or text you for the purpose of account opening even though you may be registered on DND.</p>\\n\",\"note_verifiycation_pan_dob_text\":\"<p>By continuing, I agree to <a href=\\\"https://www.arihantcapital.com/termsandconditions\\\" target=\\\"_blank\\\"><strong>T&amp;C</strong> and <strong>Privacy Policy</strong></a>.</p>\\n\",\"note_verifiycation_email_text\":\"<p>Make sure to verify your email Id by clicking on the link we have sent. It is mandatory to complete your application.</p>\\n\",\"document_photograph_popup_text\":\"<p>Please take a clear picture on a clear background. No hats/ sunglasses please, save them for later.</p>\\n\",\"document_signature_popup_text\":\"\",\"document_Income_proof_popup_text\":\"\",\"email_verify_popup_text\":\"\"}",
          "id_login_register_add_image": "https://prod-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1651642313809_id_login_register_add_image.jpeg"
        }
      };
    } else {
      resultObj = {
        "success": true,
        "result": {
          "_id": "61caf57391dc9100098e3076",
          "username_primary_text": "",
          "username_secondary_text": "",
          "username_title": "",
          "username_sub_text": "",
          "mobile_primary_text": "Put your money to work!",
          "mobile_secondary_text": "Open a demat & trading account for free, and start investing in stocks, IPOs and ETFs, or trade in F&O! Zero paperwork, and get started in just 7 minutes.",
          "mobile_title": "Trading with India's most trusted broker, got even better!",
          "mobile_sub_text": "Trade equities, futures, options, indices, ETFs on our all new mobile app ArihantPlus with superior performance & really easy user experience.",
          "email_primary_text": "",
          "email_secondary_text": "One account, unlimited financial opportunity get started now\n(In just 10 minutes)",
          "email_title": "What's your email ID?",
          "email_sub_text": "Email verification is mandatory",
          "pan_dob_primary_text": "A tested & trusted platform for investing",
          "pan_dob_secondary_text": "Welcome to the club! Let' s be the everyday partner in understanding better ways to invest and Arihant capital together.",
          "pan_dob_title": "Basic details",
          "pan_dob_sub_text": "PAN is compulsory for investing in India",
          "welcome_text": "The objective of KYC guidelines is to prevent your account from being used, by unauthorized users.\n\nIt also enables us to understand your financial dealings better and will help us serve & manage your risk profile better.",
          "kra_digilocker_text": "Let us help you to get registered even faster. Use your DigiLocker account and use the already verified documents such as Aadhaar, PAN, DL, etc. to complete your KYC form.",
          "non_kra_manual_text": "Your information is secure; we use bank grade security.",
          "id_welcome_message": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/MicrosoftTeams-image.png",
          "id_aadhaar_details": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1644562897085_id_aadhaar_details.png",
          "id_personal_details": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691061_id_personal_details.png",
          "id_address_details": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1642759463634_id_address_details.png",
          "id_segment_details": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691309_id_segment_details.png",
          "id_nominee_details": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691474_id_nominee_details.png",
          "id_bank_details": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1643621691612_id_bank_details.png",
          "__v": 0,
          "data": "{\"thank_you_content\":\"\",\"welcome_content\":\"<h3>You are just a few steps away from making your first trade!</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>Good news! Some details are pre-filled from KRA, to make your journey a breeze</p>\\n\",\"welcome_content_digilocker\":\"<p>&nbsp;</p>\\n<quillbot-extension-portal></quillbot-extension-portal>\",\"welcome_KRA_DIGILOCKER_verified\":\"<h3>You are just a few steps away from making your first trade!</h3>\\n\",\"personal_details_content\":\"<h3>While we have you, we&rsquo;d love to know you better!</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>Lets jump through the process by filling in the following details (mandatory). To make the process easier, we&rsquo;ve pre-filled &amp; verified some information from your PAN and DigiLocker as provided by you.</p>\\n\",\"address_details_content\":\"<h3>Please validate your address.</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>For your convenience, we&rsquo;ve fetched this information from your PAN and DigiLocker as provided by you.</p>\\n\",\"nominee_details_content\":\"<h3>Nominee Details</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>It&rsquo;s always a good practice to nominate someone, in case you are not around.</p>\\n\",\"bank_details_content\":\"<h3>Bank Details</h3>\\n\\n<p>&nbsp;</p>\\n\\n<p>Make sure you add the bank account that&rsquo;s in your name and from which you will transact funds for trading.</p>\\n\",\"confirm_esign_content\":\"<h3>Lastly, let&#39;s e-Sign your application!</h3>\\n\\n<p><span style=\\\"color:#202124\\\">eSign your application using Aadhar OTP.<br />\\n<br />\\nYou will now be redirected to the NSDL website.</span></p>\\n\\n<p><span style=\\\"color:#202124\\\">In case your mobile number is not linked to Aadhar or if you are facing any problem during the e-sign process, please contact our customer support desk.</span></p>\\n\\n<p>&nbsp;</p>\\n\\n<p>&nbsp;</p>\\n\",\"nominee_document_upload_note\":\"<p><b>Please Note:</b>For each nominee you add here, you will have to upload a valid address proof in the upcoming step entitled as &ldquo;Documents Upload&rdquo;. Please note that in case any nominee is a minor, their guardian&#39;s address proof has to be submitted.</p>\\n\",\"security_note_bank_page\":\"Don’t worry! Your information is secure with us, we use bank grade security.\",\"transfer_credit_note\":\"\",\"need_help_popup_text\":\"<p>Tell us what happened and we would love to help you out!</p>\\n\",\"logout_popup_text\":\"<p>Are you sure you want to go?</p>\\n\\n<p><br />\\nDon&rsquo;t worry, your information is saved. You can come back to complete it anytime.</p>\\n\",\"login_information_text\":\"<p>By submitting your contact details, you authorise Arihant Capital Markets Ltd to call or text you for the purpose of account opening even though you may be registered on DND.</p>\\n\",\"note_verifiycation_pan_dob_text\":\"<p>By proceeding I agree to <a href=\\\"https://www.arihantcapital.com/termsandconditions\\\" target=\\\"_blank\\\"><strong>T&amp;C</strong> </a> and <a href=\\\"https://www.arihantplus.com/privacy-and-security\\\" target=\\\"_blank\\\"><strong>Privacy Policy</strong></a> of ACML</p>\\n\",\"note_verifiycation_email_text\":\"<p>Make sure to verify your email Id by clicking on the link we have sent. It is mandatory to complete your application.</p>\\n\",\"document_photograph_popup_text\":\"<p>Please take a clear picture on a clear background. No hats/ sunglasses please, save them for later.</p>\\n\",\"document_signature_popup_text\":\"\",\"document_Income_proof_popup_text\":\"\",\"email_verify_popup_text\":\"\"}",
          "id_login_register_add_image": "https://uat-public-img.s3.ap-south-1.amazonaws.com/site_content_upload/1651642313809_id_login_register_add_image.jpeg"
        }
      };
    }

    return of(resultObj);
    // return this.http.get<any>(`${environment.baseUrl}api/getSiteContent`);
  }

  /**
   * get step info of config flow
   */
  configInfo(): Observable<any> {
    const data = { 'login_type': environment.login_type }; // login_type = Mobile_OTP, Email_Password, Pan_DOB
    return this.http.post<any>(`${environment.baseUrl}api/configInfo`, data);
  }

  /**
   * Common validation of auth fields
   */
  commonValidation(data: any = '', hideLoader: boolean = false): Observable<any> {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
      options['reportProgress'] = true;
      options['observe'] = 'events';
    }
    data['login_type'] = environment.login_type; // login_type = Mobile_OTP, Email_Password, Pan_DOB
    return this.http.post<any>(`${environment.baseUrl}api/commonValidation`, data, options);
  }

  getBrokerPlans(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}api/getBrokerPlans`);
  }

  getBrokeragePlanList(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrlOfUser}api/getBrokeragePlanList`);
  }

  removeLogoutApi(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}api/logout`);
  }

  getAINEXTToken(queryParam, hideLoader: boolean = false) {
    let options = {}
    if (hideLoader) {
      // const params = new HttpParams().set('hideLoader', 'true');
      let params = new HttpParams();
      params = params.append('hideLoader', 'true');
      // params = params.append('hyper', 'true');
      options = { params: params };
      // options['reportProgress'] = true;
      // options['observe'] = 'events';
    }
    return this.http.get<any>(`${environment.baseUrl}api/aiNxtAuth`, options);
  }

  validateCardExpiry(expiry) {
    // Check if expiry date is in MM/YY format
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return false;
    }

    // Split the expiry date into month and year
    let [month, year] = expiry.split('/');
    month = parseInt(month, 10);
    year = parseInt(year, 10);

    // Validate month range
    if (month < 1 || month > 12) {
      return false;
    }

    // Get the current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns month from 0 to 11
    const currentYear = now.getFullYear() % 100; // Get last two digits of the year

    // Validate expiry date
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }



}