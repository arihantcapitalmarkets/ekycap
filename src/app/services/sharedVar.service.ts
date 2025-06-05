import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedVarService {
  private routerInfo: BehaviorSubject<boolean>;
  private userInfo: BehaviorSubject<any>;
  private timerInfo: BehaviorSubject<any>;
  private timerValue: BehaviorSubject<any>;
  private timerInfoAccessToken: BehaviorSubject<any>;
  private timerValueAccessToken: BehaviorSubject<any>;
  private stepsInfo: BehaviorSubject<any>;
  private PageInfo: BehaviorSubject<any>;
  private AadharPanInfo: BehaviorSubject<any>;
  private bankInfoValue: BehaviorSubject<any>;
  private configFlow: BehaviorSubject<any>;
  private configStep: BehaviorSubject<any>;
  private siteContent: BehaviorSubject<any>;
  private esignPdfData: BehaviorSubject<any>;
  private previousUrl: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private isUserExperiorWorks = new BehaviorSubject<boolean>(false);

  constructor() {
    this.routerInfo = new BehaviorSubject<boolean>(false);
    this.userInfo = new BehaviorSubject<any>('');
    this.timerInfo = new BehaviorSubject<any>(false);
    this.timerValue = new BehaviorSubject<any>('');
    this.timerInfoAccessToken = new BehaviorSubject<any>(false);
    this.timerValueAccessToken = new BehaviorSubject<any>('');
    this.stepsInfo = new BehaviorSubject<any>('');
    this.PageInfo = new BehaviorSubject<any>('');
    this.AadharPanInfo = new BehaviorSubject<any>('');
    this.bankInfoValue = new BehaviorSubject<any>('');
    this.configFlow = new BehaviorSubject<any>('');
    this.configStep = new BehaviorSubject<any>('');
    this.siteContent = new BehaviorSubject<any>('');
    this.esignPdfData = new BehaviorSubject<any>('');
    this.isUserExperiorWorks = new BehaviorSubject<boolean>(false);
  }

  setUserExperiorWorks(previousUrl: boolean) {
    this.isUserExperiorWorks.next(previousUrl);
  }

  getUserExperiorWorks(): Observable<any> {
    return this.isUserExperiorWorks.asObservable();
  }

  setPreviousUrl(previousUrl: string) {
    this.previousUrl.next(previousUrl);
  }

  getPreviousUrl(): Observable<any> {
    return this.previousUrl.asObservable();
  }

  getValue(): Observable<boolean> {
    return this.routerInfo.asObservable();
  }
  setValue(newValue): void {
    this.routerInfo.next(newValue);
  }
  /**
   * get logged user info and set logged user info
   */
  getLoggedUserInfoValue(): Observable<any> {
    return this.userInfo.asObservable();
  }
  setLoggedUserInfoValue(newValue): any {
    this.userInfo.next(newValue);
  }
  /**
   * get time info and set time info
   */
  getTimerInfoValue(): Observable<any> {
    return this.timerInfo.asObservable();
  }
  setTimerInfoValue(newValue): any {
    this.timerInfo.next(newValue);
  }
  /**
   * get timer value and set timer value
   */
  getTimerValue(): Observable<any> {
    return this.timerValue.asObservable();
  }
  setTimerValue(newValue): any {
    this.timerValue.next(newValue);
  }
  /**
   * get steps info
   */
  getStepsInfo(): Observable<any> {
    return this.stepsInfo.asObservable();
  }
  setStepsInfo(newValue): any {
    this.stepsInfo.next(newValue);
  }

  /**
  * get Active Page Info and set Active Page Info
  */
  getActivePageInfoValue(): Observable<any> {
    return this.PageInfo.asObservable();
  }
  setActivePageInfoValue(newValue): any {
    this.PageInfo.next(newValue);
  }

  /**
  * get Aadhar Pan info and set Aadhar Pan info
  */
  getAadharPanInfoValue(): Observable<any> {
    return this.AadharPanInfo.asObservable();
  }
  setAadharPanInfoValue(newValue): any {
    this.AadharPanInfo.next(newValue);
  }

  /**
  * Set Bank Info and Get Bank Info
  */
  getBankInfoValue(): Observable<any> {
    return this.bankInfoValue.asObservable();
  }
  setBankInfoValue(newValue): any {
    this.bankInfoValue.next(newValue);
  }


  /**
     * set/get Configure flow 
     */
  getConfigFlowData(): Observable<any> {
    return this.configFlow.asObservable();
  }

  setConfigFlowData(newValue): any {
    this.configFlow.next(newValue);
  }

  /**
     * set/get Configure Step Info 
     */
  getConfigStepData(): Observable<any> {
    return this.configStep.asObservable();
  }

  setConfigStepData(newValue): any {
    this.configStep.next(newValue);
  }

  /**
     * set/get Dynamic content 
     */
  getSiteContentData(): Observable<any> {
    return this.siteContent.asObservable();
  }

  setSiteContentData(newValue): any {
    this.siteContent.next(newValue);
  }

  /**
   * set/get Esign data 
   */
  getEsignPdfData(): Observable<any> {
    return this.esignPdfData.asObservable();
  }

  setEsignPdfData(newValue): any {
    this.esignPdfData.next(newValue);
  }

  /**
  * get timer value and set timer value  FOR ACCESS TOKEN
  */
  getTimerValueAccessToken(): Observable<any> {
    return this.timerValueAccessToken.asObservable();
  }
  setTimerValueAccessToken(newValue): any {
    this.timerValueAccessToken.next(newValue);
  }
  /**
   * get time info and set time info  FOR ACCESS TOKEN
   */
  getTimerInfoValueAccessToken(): Observable<any> {
    return this.timerInfoAccessToken.asObservable();
  }
  setTimerInfoValueAccessToken(newValue): any {
    this.timerInfoAccessToken.next(newValue);
  }
}