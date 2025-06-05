import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../shared/models/user';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SharedVarService } from '../services/sharedVar.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { GlobalService } from '../services/global.service';
declare let ue: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  baseUrl = environment.baseUrl + 'api/';
  baseUrlOfUser = environment.baseUrlOfUser + 'api/';

  passwordStrength: any;
  passwordErrors: any;
  passwordMaintain = [
    { 'id': 1, 'message': 'Must contain at least 8 letters.' },
    { 'id': 2, 'message': 'Must contain at least one lowercase character(a-z).' },
    { 'id': 3, 'message': 'Must contain at least one uppercase character(A-Z).' },
    { 'id': 4, 'message': 'Must contain at least one special character(eg $).' },
    { 'id': 5, 'message': 'Must contain at least one digit(0-9).' },
  ];
  timeUp: Boolean;
  timerOfOtp: any;
  timerShow: any;

  constructor(
    private http: HttpClient, private router: Router,
    private cookieService: CookieService,
    private sharedVarService: SharedVarService,
    private toastr: ToastrService,
    public global: GlobalService,
    public translate: TranslateService,
  ) {
  }

  /**
   * For login username, email-id
   * @param username
   * @param password  
   */
  register(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `checkUsername`, credentials);
  }

  /**
   * For register username, email-id
   * @param username
   * @param password  
   */
  login(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `login`, credentials);
  }

  /**
  * For register mobile number, email-id
  * @param mobilenumber
  * @param email_id  
  */
  checkEmailMobileNumber(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `checkEmailAndMobile`, credentials);
  }

  /**
  * For register mobile number, email-id
  * @param mobilenumber
  * @param email_id  
  */
  checkEmailExist(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `generateMannualToken`, credentials);
  }

  /**
  * For get authrization token from FB token(OF APP)
  */
  getAccessTokenFromFB(credentials: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `fbToken`, credentials);
  }


  /**
   * Pan verification by KRA API
   */
  verifyPanDetailsByKRA(hideLoader: boolean = false): Observable<any> {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
      options['reportProgress'] = true;
      options['observe'] = 'events';
    }
    return this.http.get<any>(this.baseUrlOfUser + `verifyPanDetail`, options);
  }

  /**
   * For register mobile number, email-id
   * @param mobilenumber
   * @param email_id  
   */
  registerMobile(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `insertContactDetails`, credentials);
  }

  /**
   * To get OTP on mobile number for reset password
   * @param username
   */
  forgotPassword(credentials: User) {
    return this.http.post<any>(this.baseUrl + `forgotPassword`, credentials);
  }

  /**
   * To get OTP on mobile number for reset password
   * @param {otp, password}
   */
  resetPassword(credentials: User) {
    return this.http.post<any>(this.baseUrl + `resetPassword`, credentials);
  }



  /**
   * For Verity otp
   * @param OTP  
   */
  verifyOtp(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `verifyOtp`, credentials);
  }

  /**
   * For Verity otp while login
   * @param OTP  
   */
  verifyLoginOtp(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `verifyLoginOtp`, credentials);
  }

  /**
   * For resend otp while login/register
   * @param OTP  
   */
  resendOtp(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `resentOtp`);
  }

  /**
   * For resend otp while login/register
   * @param OTP  
   */
  resendOTP(mobileNumber: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `resendOtp`, mobileNumber);
  }

  /**
   * For email verification
   * @param email_token  
   */
  emailVerification(token: any): Observable<any> {
    const paramObj = { 'token': token };
    return this.http.post<any>(this.baseUrl + `verifyEmail`, paramObj);
  }

  /**
   * For email verification
   * @param email_token  
   */
  commonEmailVerification(token: any): Observable<any> {
    const paramObj = { 'token': token };
    return this.http.post<any>(this.baseUrl + `verifyEmailToken`, paramObj);
  }

  /**
   * For email verification
   * @param email_token  
   */
  googleEmailVerification(token: any): Observable<any> {
    const paramObj = { 'code': token };
    return this.http.post<any>(this.baseUrl + `generateGoogleToken`, paramObj);
  }

  googleEmailVerify(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `googleEmailVerification`, obj);
  }

  googleIdTokenValidate(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `googleIdTokenValidate`, obj);
  }

  /**
  * For email verification
  * @param email_token  
  */
  appleEmailVerification(token: any): Observable<any> {
    const paramObj = { 'code': token };
    return this.http.post<any>(this.baseUrl + `generateAppleToken`, paramObj);
  }

  /**
   * For email verification
   * @param email_token  
   */
  facebookEmailVerification(token: any): Observable<any> {
    const paramObj = { 'code': token };
    return this.http.post<any>(this.baseUrl + `generateFacebookToken`, paramObj);
  }

  /**
   * Get User details
   */
  getUserDetails(): Observable<any> {
    return this.http.get<any>(this.baseUrlOfUser + `getUserDetailsByToken`);
  }

  /**
   * Initialize password
   */
  initializePassword() {
    this.passwordMaintain.map((item: any) => {
      item['valid_password_type'] = false;
    });
    this.passwordStrength = '';
  }

  /**
   * Validate password
   * @param event 
   */
  strength(event: any) {
    const password = event.target.value;
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    if (strongRegex.test(password)) {
      this.passwordStrength = 'strong';
    }
    // else if (mediumRegex.test(password)) {
    //   this.passwordStrength = 'medium';
    // } 
    else if (password !== '') {
      this.passwordStrength = 'weak';
    } else {
      this.passwordStrength = '';
    }

    const lowerCaseRegex = new RegExp("^(?=.*[a-z])");
    const upperCaseRegex = new RegExp("^(?=.*[A-Z])");
    var p = password,
      passwordErrors = [];
    if (p.length < 8) {
      passwordErrors.push(1);
    }
    if (!lowerCaseRegex.test(password)) {
      passwordErrors.push(2);
    }
    if (!upperCaseRegex.test(password)) {
      passwordErrors.push(3);
    }
    if (p.search(/[*@!#$%&()^~{}]+/) < 0) {
      passwordErrors.push(4);
    }
    if (p.search(/[0-9]/) < 0) {
      passwordErrors.push(5);
    }
    if (password) {
      this.passwordMaintain.map((item: any) => {
        item['valid_password_type'] = true;
      });
    } else {
      this.passwordMaintain.map((item: any) => {
        item['valid_password_type'] = false;
      });
    }
    if ((passwordErrors.length > 0) && (password)) {
      this.passwordErrors = passwordErrors;
      this.passwordMaintain.map((item: any) => {
        if (passwordErrors.includes(Number(item.id))) {
          item['valid_password_type'] = false;
        }
      });
    } else {
      this.passwordErrors = [];
    }
  }

  destroyTimer() {
    this.timeUp = false;
    this.sharedVarService.setTimerInfoValue(this.timeUp);
    this.sharedVarService.setTimerValue('');
    this.timerShow = '';
    clearInterval(this.timerOfOtp);
  }

  /**
   * Timer Set up for OTP
   */
  timerOtp() {
    this.timeUp = false;
    this.sharedVarService.setTimerInfoValue(this.timeUp);
    this.sharedVarService.setTimerValue('');
    /***************** TIMER OF OTP:START *******************/
    // Set the date we're counting down to
    var oldDateObj = new Date();
    var newDateObj: any = new Date();
    if (this.cookieService.get('otpMaxTime')) {
      newDateObj = this.cookieService.get('otpMaxTime');
      let countDownDate: any = newDateObj;
      // console.log('this.timerShow', this.timerShow, this.timerOfOtp);
      this.timerShow = '';
      this.timerOfOtp = 0;

      // Update the count down every 1 second
      this.timerOfOtp = setInterval(() => {
        var now = new Date().getTime(); // Get today's date and time
        let distance = countDownDate - now;
        // console.log('distance', distance);
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds: any = Math.floor((distance % (1000 * 60)) / 1000);

        seconds = ("0" + seconds).slice(-2);
        this.timerShow = " " + minutes + " : " + seconds;

        this.sharedVarService.setTimerValue(this.timerShow);
        if (distance < 0) {
          this.timerShow = "";
          this.cookieService.delete('otpMaxTime');
          this.timeUp = true;
          this.sharedVarService.setTimerInfoValue(this.timeUp);
          this.sharedVarService.setTimerValue(this.timerShow);
          clearInterval(this.timerOfOtp);
          return false;
        }
      }, 1000);
    } else {
      this.timeUp = true;
      this.sharedVarService.setTimerInfoValue(this.timeUp);
    }
    /***************** TIMER OF OTP:STOP *******************/
  }

  /**
  * For register mobile number, email-id
  * @param mobilenumber
  */
  commonLoginApi(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + `commonLoginApi`, credentials);
  }

  regenerateAccessToken(obj: any, hideLoader: boolean = false): Observable<any> {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
    }
    return this.http.post<any>(this.baseUrl + `getAccessToken`, obj, options);
  }


  timeUpExpiryAccessToken: boolean;
  timerShowExpiryAccessToken = '';
  timerOfOtpExpiryAccessToken: any;
  destroyTimerExpiryAccessToken() {
    this.timeUpExpiryAccessToken = false;
    this.sharedVarService.setTimerInfoValueAccessToken(this.timeUpExpiryAccessToken);
    this.sharedVarService.setTimerValueAccessToken('');
    this.timerShowExpiryAccessToken = '';
    clearInterval(this.timerOfOtpExpiryAccessToken);
  }

  /**
   * Timer Set up for OTP
   */
  timerOtpExpiryAccessToken() {
    this.timeUpExpiryAccessToken = false;
    this.sharedVarService.setTimerInfoValueAccessToken(this.timeUpExpiryAccessToken);
    this.sharedVarService.setTimerValueAccessToken('');
    /***************** TIMER OF ACCESS TOKEN:START *******************/
    // Set the date we're counting down to
    var oldDateObj = new Date();
    var newDateObj: any = new Date();
    if (this.cookieService.get('accessTokenExp')) {
      newDateObj = this.cookieService.get('accessTokenExp');
      let countDownDate: any = newDateObj;
      // console.log('this.timerShowExpiryAccessToken', this.timerShowExpiryAccessToken, this.timerShowExpiryAccessToken);
      this.timerShowExpiryAccessToken = '';
      this.timerOfOtpExpiryAccessToken = 0;

      // Update the count down every 1 second
      this.timerOfOtpExpiryAccessToken = setInterval(() => {
        var now = new Date().getTime(); // Get today's date and time
        let distance = countDownDate - now;
        // console.log('distance', distance);
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds: any = Math.floor((distance % (1000 * 60)) / 1000);

        seconds = ("0" + seconds).slice(-2);
        this.timerShowExpiryAccessToken = " " + minutes + " : " + seconds;

        this.sharedVarService.setTimerValueAccessToken(this.timerShowExpiryAccessToken);
        if (distance < 0) {
          if (localStorage.getItem('ref_token')) {
            this.timerShowExpiryAccessToken = "";
            this.timeUpExpiryAccessToken = true;
            this.sharedVarService.setTimerInfoValueAccessToken(this.timeUpExpiryAccessToken);
            this.sharedVarService.setTimerValueAccessToken(this.timerShowExpiryAccessToken);
            // console.log('clearInterval timerOfOtpExpiryAccessToken', this.timerOfOtpExpiryAccessToken);
            clearInterval(this.timerOfOtpExpiryAccessToken);
            let obj = {};
            obj['refreshToken'] = JSON.parse(localStorage.getItem('ref_token'));
            this.regenerateAccessToken(obj, true).subscribe((data) => {
              // Handle API data here
              // console.log(data);
              if (data?.result?.token) {
                // this.cookieService.set('user_auth_token', data?.result?.token);
                this.setCookieAuthUserToken(data?.result?.token);
                if (environment.isRefreshTokenCheck) {
                  this.setAccessTokenExpiry();
                }
              } else {
                this.destroyTimerExpiryAccessToken();
                this.clearLocalStorage();
                this.errorToastr('Authentication Time OUT, Please login again to continue...');
                this.logoutWithoutSession();
                // this.router.navigate(['/']);
              }
            })
          } else {
            this.timerShowExpiryAccessToken = "";
            this.cookieService.delete('accessTokenExp');
            this.timeUpExpiryAccessToken = true;
            this.sharedVarService.setTimerInfoValueAccessToken(this.timeUpExpiryAccessToken);
            this.sharedVarService.setTimerValueAccessToken(this.timerShowExpiryAccessToken);
            // console.log('clearInterval');
            clearInterval(this.timerOfOtpExpiryAccessToken);
            this.errorToastr('Authentication Time OUT, Please login again to continue...');
            this.router.navigate(['/']);
            return false;
          }
        }
      }, 1000);
    } else {
      this.timeUpExpiryAccessToken = true;
      this.sharedVarService.setTimerInfoValueAccessToken(this.timeUpExpiryAccessToken);
    }
    /***************** TIMER OF ACCESS TOKEN:STOP *******************/
  }

  setCookieAuthUserToken(accessToken: any) {
    if (environment.setAccessTokenWithExpireTime) {
      this.cookieService.set('user_auth_token', accessToken, this.getCookieExpiredAuthTokenTime());
    } else {
      this.cookieService.set('user_auth_token', accessToken);
    }
  }
  getCookieExpiredAuthTokenTime() {
    const date = new Date();
    date.setTime(date.getTime() + (8 * 60 * 60 * 1000)); // for Hours
    console.log('date', date);
    return date;
  }

  /**
   * Set Access Token Expiry to check for every 1 second that it is expire or not  
   */
  setAccessTokenExpiry() {
    let newDateObj: any = new Date();
    newDateObj = newDateObj.setTime(newDateObj.getTime() + (Number(environment.configExpAccessToken) * 60 * 1000)); // for 1 minute
    this.cookieService.set('accessTokenExp', newDateObj, this.getCookieExpiredTimeAccessToken());
    this.timerOtpExpiryAccessToken();
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

  /**
  * Error Toastr
  */
  errorToastr(message: any, title: any = 'Error') {
    this.toastr.error(this.translate.instant(message), title);
  }

  /**
  * get expired time or set expired time
  */
  getCookieExpiredTimeAccessToken() {
    const date = new Date();
    date.setTime(date.getTime() + (Number(environment.getCookieExpiredTimeAccessToken) * 60 * 1000)); // for 1 minute
    return date;
  }

  logoutWithoutSession() {
    let rmcode = '';
    if (this.cookieService.get('rmcode')) {
      rmcode = this.cookieService.get('rmcode');
    }
    this.sharedVarService.getStepsInfo().subscribe((result) => {
      if (result?.rmCode) {
        rmcode = result?.rmCode;
      }
    });
    if (environment.userExperior && this.global.globalUserExperiorSet) {
      ue.unsetUserIdentifier();
    }
    this.clearLocalStorage();
    this.deleteMultiCookies(['user', 'user_mobile', 'login_user_token', 'user_token', 'user_auth_token', 'mfapp', 'accessTokenExp']);

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

  deleteMultiCookies(cookieParams: any) {
    cookieParams.map((item: any) => {
      this.cookieService.delete(item);
    });
  }


}
