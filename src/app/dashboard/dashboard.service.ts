import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from '../shared/models/user';
import { Document } from '../shared/models/document';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  baseUrlOfUser = environment.baseUrlOfUser + 'api/';
  baseUrl = environment.baseUrl + 'api/';
  imageUploadUrl = environment.image_upload_url + 'api/';

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Send code of DGlocker in back to get issued documents
   */
  sendCodeOfDGlocker(code: any): Observable<any> {
    // return this.http.post<any>(`https://csk56gk2eh.execute-api.us-east-2.amazonaws.com/test/api/verifyDigiLocker`, { 'code': code });
    return this.http.post<any>(this.baseUrlOfUser + `verifyDigiLocker`, { 'code': code });
  }

  /**
   * Pan verification
   */
  verifyPanNumber(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrlOfUser + `verifyPanDetail`, credentials);
  }

  /**
   * aadhar number verification
   */
  verifyaadharNumber(credentials: User): Observable<any> {
    return this.http.post<any>(this.baseUrlOfUser + `verifyaadharNumberDetail`, credentials);
  }

  /**
   * aadhar number verification
   */
  accountTypeProceed(objParam: any): Observable<any> {
    return this.http.post<any>(this.baseUrlOfUser + `accountTypeProceed`, objParam);
  }

  /**
  * get aadhar pan details
  */
  getAadharPanDetails(): Observable<any> {
    return this.http.get<any>(this.baseUrlOfUser + `getAadharPanInfo`);
  }
  /**
   * get step info
   */
  getStepsInfo(): Observable<any> {
    return this.http.get<any>(this.baseUrlOfUser + `getStepInfo`);
  }
  /**
   * get personal info
   */
  getPersonalDetails(): Observable<any> {
    return this.http.get<any>(this.baseUrlOfUser + `getPersonalDetails`);
  }

  /**
   * add personal info
   */
  addPersonalDetails(objParam: User): Observable<any> {
    return this.http.post<any>(this.baseUrlOfUser + `addPersonalDetails`, objParam);
  }

  /**
  * get address info
  */
  getAddressDetails(): Observable<any> {
    return this.http.get<any>(this.baseUrlOfUser + `getAddressDetails`);
  }

  /**
  * address details
  */
  addAddressDetails(objParam: User): Observable<any> {
    return this.http.post<any>(this.baseUrlOfUser + `addAddressDetails`, objParam);
  }

  /**
   * get segement brokerage category
   */
  getSegmentCategory() {
    return this.http.get<any>(this.baseUrl + `getSegmentCategory`);
  }

  /**
   * Save Segment
   */
  segmentSubmit(objParam: any) {
    return this.http.post<any>(this.baseUrl + `savePlans`, objParam);
  }

  /**
   * Save Nominee details
   */
  saveNomineeDetails(objParam: any) {
    return this.http.post<any>(this.baseUrlOfUser + `saveNominee`, objParam);
  }
  /**
   * get nominee info
   */
  getNominee() {
    return this.http.get<any>(this.baseUrlOfUser + `getNominee`);
  }

  getNomineeDocuments(objParam) {
    return this.http.post<any>(this.baseUrl + `getNomineeDocuments`, objParam);
  }

  /**
   * Save Trading & DEMAT details
   */
  saveTrandingDetails(objParam: any) {
    return this.http.post<any>(this.baseUrl + `addTrandingDetails`, objParam);
  }

  /**
   * Save Trading & DEMAT details
   */
  retriveTradingDetails() {
    return this.http.get<any>(this.baseUrl + `retriveTradingDetails`);
  }

  /**
  * Remove nominee Image/Files from DB
  */
  deleteNomineeDocument(obj: any) {
    return this.http.post<any>(this.baseUrl + `deleteNomineeDocument`, obj);
  }

  /**
   * get sub category from category id
   */
  getPlans() {
    return this.http.get<any>(this.baseUrl + `getPlans`);
  }

  /**
   * get trading account type
   */
  getTradingAccounts(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `getTradingAccounts`);
  }

  /**
   * search bank details from ifsc_code
   * @param objParam 
   */
  searchBankeDetails(objParam: any) {
    return this.http.post<any>(this.baseUrlOfUser + `searchIfscCode`, objParam);
  }

  /**
   * submit bank details
   * @param objParam 
   */
  getBankDetails() {
    return this.http.get<any>(this.baseUrlOfUser + `getBankDetails`);
  }

  /**
   * UPI BANK VERIFICATION
   */
  generateUPIQr() {
    return this.http.get<any>(`${environment.baseUrl}api/generateUPIQr`);
  }
  /**
   * Check Bank Verification Status
   */
  bankVerificationStaus(hideLoader: boolean = true) {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
    }
    return this.http.get<any>(`${environment.baseUrlOfUser}api/bankVerificationStaus`, options);
  }

  /**
   * Check Bank Verification Status
   */
  paymentVerificationStaus(hideLoader: boolean = true) {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
    }
    return this.http.get<any>(`${environment.baseUrlOfUser}api/paymentVerificationStaus`, options);
  }

  /**
  * Payment Verification Status using transaction id
  */
  paymentVerificationStausUsingTransactionId(ObjParam: any) {
    return this.http.post<any>(`${environment.baseUrlOfUser}api/paymentVerificationStaus`, ObjParam);
  }

  /**
   * submit bank details
   * @param objParam 
   */
  submitBankDetails(objParam: any) {
    return this.http.post<any>(this.baseUrlOfUser + `verifyBankDetails`, objParam);
  }

  /**
  * Remove bank details
  */
  removeBankDetails() {
    return this.http.get<any>(this.baseUrlOfUser + `editBank`);
  }


  /**
   * get ekyc document list 
   */
  getDocumentAvailable(objParam: any = '', hideLoader: boolean = false) {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
      options['reportProgress'] = true;
      options['observe'] = 'events';
    }
    if (objParam) {
      return this.http.post<any>(this.baseUrlOfUser + `getKycDocuments`, objParam, options);
    } else {
      return this.http.get<any>(this.baseUrlOfUser + `getKycDocuments`, options);
    }
  }

  /**
   * get ekyc document list 
   */
  getSectionDocumentAvailable(objParam: any = '', hideLoader: boolean = false) {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
      options['reportProgress'] = true;
      options['observe'] = 'events';
    }
    if (objParam) {
      return this.http.post<any>(this.baseUrlOfUser + `getDocumentAPI`, objParam, options);
    } else {
      return this.http.get<any>(this.baseUrlOfUser + `getKycDocuments`, options);
    }
  }

  /**
   * Aadhar upload api
   */
  uploadDocument(obj: any) {
    const params = new HttpParams().set('hideLoader', 'true');
    let options = { params: params };
    options['reportProgress'] = true;
    options['observe'] = 'events';
    return this.http.post<any>(`${this.imageUploadUrl}uploadUserDocuments`, obj, options);
  }

  /**
   * Aadhar upload api
   */
  uploadPhotographDocument(obj: any) {
    const params = new HttpParams().set('hideLoader', 'true');
    let options = { params: params };
    options['reportProgress'] = true;
    options['observe'] = 'events';
    return this.http.post<any>(`${this.imageUploadUrl}uploadTempDocument`, obj);
  }

  /**
  * Aadhar upload api
  */
  uploadIncomeProof(obj: any) {
    const params = new HttpParams().set('hideLoader', 'true');
    let options = { params: params };
    options['reportProgress'] = true;
    options['observe'] = 'events';
    return this.http.post<any>(`${this.imageUploadUrl}uploadTempDocument`, obj, options);
  }


  /**
   * get document data from document_name 
   */
  getDocumentDetails(objParam: any): Observable<Document> {
    return this.http.post<any>(this.baseUrlOfUser + `getUserDocuments`, objParam);
  }

  getDocumentDetailsWithLoaderOption(objParam: any, hideLoader: boolean = false): Observable<Document> {
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      let options = { params: params };
      return this.http.post<any>(this.baseUrlOfUser + `getUserDocuments`, objParam, options);
    } else {
      return this.http.post<any>(this.baseUrlOfUser + `getUserDocuments`, objParam);
    }
  }

  /**
   * get PAN document list 
   */
  getPanDocument(objParam: any = '', hideLoader: boolean = false) {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
      options['reportProgress'] = true;
      options['observe'] = 'events';
    }
    return this.http.get<any>(`${environment.baseUrl}api/getPanDocument`, options);
  }

  /**
   * send otp for IPV
   */
  sendOtpForIPV() {
    return this.http.get<any>(`${this.baseUrlOfUser}sendOtpForIPV`);
  }

  /**
   * Remove Image/Files from DB
   */
  removeImageFileDocument(obj: any) {
    return this.http.post<any>(this.baseUrlOfUser + `deleteUserDocument`, obj);
  }

  /**
   * If email not verfiy then send email to verify
   */
  verifyEmail() {
    return this.http.get<any>(this.baseUrlOfUser + `verifyEmail`);
  }

  /**
   * If email not verfiy then re-send email to verify
   */
  resendVerificationEmail() {
    return this.http.get<any>(this.baseUrlOfUser + `resendVerificationEmail`);
  }

  /**
   * If Email verification by OTP
   */
  otpVerificationOfEmail(obj: any) {
    return this.http.post<any>(this.baseUrlOfUser + `verifyEmailOTP`, obj);
  }

  /**
   * Share photocapture link to user through email
   * @returns 
   */
  sharePhotoCaptureLink() {
    return this.http.get<any>(this.baseUrlOfUser + `generateTempLink`);
  }


  /**
   * If Update email and email send
   */
  updateEmailSendEmail(obj: any) {
    return this.http.post<any>(this.baseUrlOfUser + `updateEmail`, obj);
  }

  resendEmail() {
    const data = { login_type: 'Mobile_OTP' };
    return this.http.post<any>(this.baseUrl + `resendEmail`, data);
  }

  isEmailTokenVerified() {
    const data = { login_type: 'Mobile_OTP' };
    return this.http.post<any>(this.baseUrl + `isEmailTokenVerified`, data);
  }
  /**
   * finish EKYC : checking all details verified or not in final step 
   */
  submitDocumentUpload(hideLoader: boolean = false) {
    // return this.http.get<any>(this.baseUrlOfUser + `submitDocs`);
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      let options = { params: params };
      return this.http.get<any>(this.baseUrlOfUser + `submitDocs`, options);
    } else {
      return this.http.get<any>(this.baseUrlOfUser + `submitDocs`);
    }
  }

  /**
   * finish EKYC : checking all details verified or not in final step 
   */
  finishEKYC() {
    return this.http.get<any>(this.baseUrlOfUser + `completeEkycStep`);
  }

  /**
   * RE-Submit EKYC : checking all details verified or not in final step 
   */
  reSubmitEKYCData() {
    return this.http.get<any>(this.baseUrlOfUser + `resubmit`);
  }

  /**
   * Check code is valid or not
   */
  isCodeValid(obj: any) {
    return this.http.post<any>(this.baseUrl + `isRMExist`, obj);
  }

  /**
   * Check code is valid or not
   */
  checkPinCode(obj: any) {
    return this.http.post<any>(this.baseUrl + `checkPinCode`, obj);
  }

  /**
   * Get Declarations
   * @returns 
   */
  getDeclarations(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrlOfUser}api/getDeclrations`);
  }

  saveDeclarations(obj: any) {
    return this.http.post<any>(`${environment.baseUrlOfUser}api/submitDelcrations`, obj);
  }

  getUserDeclarations(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrlOfUser}api/getUserDeclarations`);
  }

  verifyDocumentIdEsign(id: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrlOfUser}api/legalityUpdate/${id}`);
  }

  /**
   * get step info
   */
  checkRMUserLoginTOKEN(obj: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}api/userLoginWithRM`, obj);
  }

  validateMsilToken(obj: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}api/validateMsilToken`, obj);
  }

  fetchCamsdetails(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}api/generateCamsURL`);
  }

  getBankMaster(stringCon: any = '', hideLoader: boolean = false): Observable<any> {
    let options = {}
    if (hideLoader) {
      const params = new HttpParams().set('hideLoader', 'true');
      options = { params: params };
    }
    return this.http.get<any>(`https://ucc.arihantcapital.com/api/v1/common/get-bank-details?${stringCon}`, options);
  }

  validateGeoLocation() {
    let options = {};
    const params = new HttpParams().set('hideLoader', 'true');
    options = { params: params };
    return this.http.get<any>(`${this.baseUrl}getUserIPAddress`, options);
  }


  makePayment(obj: any) {
    return this.http.post<any>(`${environment.baseUrlOfUser}api/paymentIntitSetu`, obj);
  }

  makePaymentInIt(obj: any) {
    return this.http.get<any>(`${environment.baseUrlOfUser}api/paymentIntit`);
  }



  aiNxtLocation(objParam: any) {
    let options = {};
    const params = new HttpParams().set('hideLoader', 'true');
    options = { params: params };
    return this.http.post<any>(`${this.baseUrl}aiNxtLocation`, objParam, options);
  }

  getStatesCities(obj: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}api/getCityStateData`, obj);
  }

}
