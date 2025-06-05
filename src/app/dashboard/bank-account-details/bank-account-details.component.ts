import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { DashboardService } from '../dashboard.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";

@Component({
  selector: 'app-bank-account-details',
  templateUrl: './bank-account-details.component.html',
  styleUrls: ['./bank-account-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, ControlMessagesComponent]
})
export class BankAccountDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("myinput") myInputField: ElementRef;
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;
  @ViewChild('mismatchcontent') misMatchModal: any;
  @ViewChild('emailNotVerify') emailNotVerify: any;
  @ViewChild('ifsc') ifscModal: any;
  @ViewChild('findIfsc') findIfscModal: any;
  @ViewChild('upiIframe') upiIframe: any;
  @ViewChild('upiApppaymentgateway') upiAppPaymentGateway: any;
  @ViewChild('removeBankDetails') removeBankDetails: any;

  private modalRef: NgbModalRef;
  private modalRefIFSC: NgbModalRef;

  eye_img: any = 'assets/images/eye-close.svg';

  bankVerificationForm: UntypedFormGroup;
  public bankDetailsform: UntypedFormGroup;
  bankAddress: any;
  findIFSCForm: UntypedFormGroup;
  commonConfigFlow: any;
  bankDetailsContent: any;
  securityNoteBankPage: any;
  transferCreditNote: any;
  displayStyle = "none";
  bankVerificationType: string;

  bankType = [{ id: 1, name: 'SAVING' }, { id: 2, name: 'CURRENT' }, { id: 3, name: 'OTHERS' }];
  dataSubscription: Subscription;

  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    private modalService: NgbModal,
    public validate: ValidationService,
    public dashboardService: DashboardService,
    public global: GlobalService,
    private serviceVarService: SharedVarService,
    public translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.bankVerificationType = '';
    setTimeout(async () => {
      if (this.verifiedSteps && this.verifiedSteps.isApproved) {
        this.global.checkIsApplicationApprove(this.verifiedSteps); return;
      }
    }, 500);

    if (this.contentData?.data) {
      const data = JSON.parse(this.contentData?.data);
      this.bankDetailsContent = data?.bank_details_content;
    }
    this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.bankDetailsContent = data?.bank_details_content;
        this.securityNoteBankPage = data?.security_note_bank_page;
        this.transferCreditNote = data?.transfer_credit_note;
      }
    });

    this.bankVerificationForm = this.fb.group({
      bankVerificationType: new UntypedFormControl('upi', [ValidationService.required]),
    });

    setTimeout(() => {
      this.isAccessibleNav();
    }, 500);


    this.serviceVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      }
    });

    this.getBankMasterList();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.verifiedSteps?.isBankAccountVerified && this.myInputField) {
        this.myInputField.nativeElement.focus();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  isAccessibleNav() {
    this.global.logEventUserExperior("Landing On Bank Details Screen");
    if (this.commonConfigFlow?.isSegmentSkip) {
      if (this.verifiedSteps.mf_app) {
        if (this.verifiedSteps.hasOwnProperty('isNominatedVerified') && !this.verifiedSteps?.isNominatedVerified) {
          setTimeout(() => {
            this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
          }, 500);
        } else {
          if (this.verifiedSteps.hasOwnProperty('isBankAccountVerified') && this.verifiedSteps?.isBankAccountVerified) {
            this.getBankDetails();
          }
        }
      } else {
        if (this.verifiedSteps.hasOwnProperty('isAddressVerified') && !this.verifiedSteps?.isAddressVerified) {
          setTimeout(() => {
            this.global.redirectToLastVerifiedToastrGold(this.verifiedSteps);
          }, 500);
        } else {
          if (this.verifiedSteps.hasOwnProperty('isBankAccountVerified') && this.verifiedSteps?.isBankAccountVerified) {
            this.getBankDetails();
          }
        }
      }
    } else {
      if (this.verifiedSteps.mf_app) {
        if (this.verifiedSteps.hasOwnProperty('isSegmentVerified') && !this.verifiedSteps?.isSegmentVerified) {
          setTimeout(() => {
            this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
          }, 500);
        } else {
          if (this.verifiedSteps.hasOwnProperty('isBankAccountVerified') && this.verifiedSteps?.isBankAccountVerified) {
            this.getBankDetails();
          }
        }
      } else {
        if (this.verifiedSteps.hasOwnProperty('isAddressVerified') && !this.verifiedSteps?.isAddressVerified) {
          setTimeout(() => {
            this.global.redirectToLastVerifiedToastrGold(this.verifiedSteps);
          }, 500);
        } else {
          if (this.verifiedSteps.hasOwnProperty('isBankAccountVerified') && this.verifiedSteps?.isBankAccountVerified) {
            this.getBankDetails();
          }
        }
      }
    }
  }

  get password() { return this.bankDetailsform.get('accountNumber'); }

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

  formValidationForIFSC() {
    const requiredIFSCCode = new UntypedFormControl('', [ValidationService.required]);
    const accountNumber = new UntypedFormControl('', [ValidationService.required, ValidationService.accountNumberValidator]);
    const requiredConfirmAccount = new UntypedFormControl('', [ValidationService.required]);
    const requiredSelection = ['', Validators.required];
    this.bankDetailsform = this.fb.group({
      IFSCCode: requiredIFSCCode,
      accountNumber: accountNumber,
      account_type: requiredSelection,
      // confirmAccountNumber: requiredConfirmAccount,
    });

    this.serviceVarService.getBankInfoValue().subscribe((res: any) => {
      if (res) {
        this.bankDetailsform.patchValue({
          IFSCCode: res.ifsc_code,
          accountNumber: res.account_number,
          account_type: res?.account_type,
          // confirmAccountNumber: res.confirm_account_number,
        });
        this.searchBankDetails(res.ifsc_code);
      }
    });
  }

  /**
   * On Select Bank Verification
   */
  onSelectBankVerification(type: string = 'upi') {
    if (type === 'upi') {
      // this.bankVerificationType = 'upi';
      this.bankVerificationForm.patchValue({ bankVerificationType: 'upi' })
    } else {
      // this.bankVerificationType = 'ifsc';
      this.bankVerificationForm.patchValue({ bankVerificationType: 'ifsc' });
      // this.formValidationForIFSC();
    }
  }

  onConfirmBankVerification() {
    if (this.bankVerificationForm.get('bankVerificationType').value === 'upi') {
      this.bankVerificationType = 'upi';
      // this.bankVerificationForm.patchValue({ bankVerificationType: 'upi' });
      this.callUpiBankVerification(); // generate QR CODE using UPI
    } else {
      this.bankVerificationType = 'ifsc';
      this.bankAddress = '';
      // this.bankVerificationForm.patchValue({ bankVerificationType: 'ifsc' });
      this.formValidationForIFSC();
    }
  }

  resetUPIFormValidation() {
    this.bankVerificationType = '';
    this.bankVerificationForm = this.fb.group({
      bankVerificationType: new UntypedFormControl('upi', [ValidationService.required]),
    });
  }

  isBankVerificationDone: boolean;
  setuResponse: any;
  gpayUpiLink: any;
  phonePayUpiLink: any;
  payTMUpiLink: any;
  BHIMUpiLink: any;
  /**
   * GENERATE QR CODE using UPI
   */
  callUpiBankVerification() {
    this.global.globalLoaderMessage();
    // console.log('window.innerHeight', window.innerHeight);
    let maxInnerHeight = window.innerHeight - 100;
    let maxInnerWidth = window.innerWidth - 100;
    // if (maxInnerHeight > 400) {
    //   maxInnerHeight = 400;
    // }
    // return;
    this.global.logEventUserExperior("Start UPI bank verification");
    this.dashboardService.generateUPIQr().subscribe((res: any) => {
      if (res.success) {
        this.isBankVerificationDone = true;
        this.setuResponse = res?.result;
        if (this.global.isMobileDevice) {
          this.isBankVerificationDone = false;
          let upiLink = res?.result?.upiLink;
          const gpayupiLink = upiLink.replace('upi://pay', 'gpay://upi/pay');
          this.gpayUpiLink = gpayupiLink;

          const phoneupiLink = upiLink.replace('upi://pay', 'phonepe://pay');
          this.phonePayUpiLink = phoneupiLink;

          const bhimupiLink = upiLink.replace('upi://pay', 'paytmmp://pay');
          this.payTMUpiLink = bhimupiLink;

          const bhimeupiLink = upiLink.replace('upi://pay', 'bhim://pay');
          this.BHIMUpiLink = bhimeupiLink;

          this.modalRef = this.modalService.open(this.upiAppPaymentGateway, { windowClass: 'upimobilemodal', size: 'md', centered: true, backdrop: 'static', keyboard: false });

          const numbers = interval(1000 * 10 * 1);
          const takeNumbers = numbers.pipe(take(15));
          this.dataSubscription = takeNumbers.subscribe(x => {
            // this.getStepInfo();
            // if (newWindow) {
            //   console.log('test window', newWindow);
            // }
            this.dashboardService.bankVerificationStaus().subscribe((res: any) => {
              if (res.success) {
                if (res.result.isBankAccountVerified) {
                  this.global.logEventUserExperior("UPI bank verified successfully");
                  this.modalRef.dismiss();
                  this.dataSubscription.unsubscribe();
                  this.isBankVerificationDone = false;
                  // newWindow.close();
                  this.verifiedSteps['isBankAccountVerified'] = true;
                  this.serviceVarService.setStepsInfo(this.verifiedSteps);
                  this.dashboardService.getStepsInfo().subscribe((res) => {
                    if (res.success) {
                      this.serviceVarService.setStepsInfo(res.result);
                    }
                    const type = 'declarations';
                    this.global.redirectToPage(type);
                  });
                }
                // console.log('result', res.result);
              }
            });
          }, error => {
            this.dataSubscription.unsubscribe();
            this.isBankVerificationDone = false;
          });
          this.modalRef.result.then((res: any) => {
            if (res === 'cancel') {
              this.isBankVerificationDone = false;
              this.resetUPIFormValidation();
              this.dataSubscription.unsubscribe();
            }
          });
          // upi://pay?pa=setuverify@kaypay&pn=Arihant%20Capital&am=1.00&tr=1213347918832993382&tn=Account%20Verification&cu=INR&mc=6211&mode=04;
        } else { // Desktop Version
          this.modalRef = this.modalService.open(this.upiIframe, { windowClass: 'mymodal', size: 'lg', centered: true, backdrop: 'static', keyboard: false });
          // let newWindow = window.open(`${res?.result?.shortUrl}`, "_blank", `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${maxInnerWidth},height=${maxInnerHeight}`);
          const numbers = interval(1000 * 10 * 1);
          const takeNumbers = numbers.pipe(take(15));
          this.dataSubscription = takeNumbers.subscribe(x => {
            // this.getStepInfo();
            // if (newWindow) {
            //   console.log('test window', newWindow);
            // }
            this.dashboardService.bankVerificationStaus().subscribe((res: any) => {
              if (res.success) {
                if (res.result.isBankAccountVerified) {
                  this.global.logEventUserExperior("UPI bank verified successfully");
                  this.modalRef.dismiss();
                  this.dataSubscription.unsubscribe();
                  this.isBankVerificationDone = false;
                  // newWindow.close();
                  this.verifiedSteps['isBankAccountVerified'] = true;
                  this.serviceVarService.setStepsInfo(this.verifiedSteps);
                  this.dashboardService.getStepsInfo().subscribe((res) => {
                    if (res.success) {
                      this.serviceVarService.setStepsInfo(res.result);
                    }
                    const type = 'declarations';
                    this.global.redirectToPage(type);
                  });
                }
                // console.log('result', res.result);
              }
            });
          }, error => {
            // newWindow.close();
            this.dataSubscription.unsubscribe();
            this.isBankVerificationDone = false;
          });
          this.modalRef.result.then((res: any) => {
            if (res === 'cancel') {
              this.isBankVerificationDone = false;
              this.resetUPIFormValidation();
              this.dataSubscription.unsubscribe();
            }
          });

        }
      }
    });
  }
  /**
   * get bank details using ifsc_code
   * @param ifsc_code 
   */
  searchBankDetails(ifsc_code: any) {
    if (ifsc_code.length === 11) {
      const objParam = { 'ifsc_code': ifsc_code.toUpperCase() };
      this.dashboardService.searchBankeDetails(objParam).subscribe((res: any) => {
        if (res.success) {
          this.bankAddress = res.result;
        } else {
          this.bankAddress = '';
          this.global.errorToastr(res.message);
        }
      });
    } else {
      this.bankAddress = '';
    }
  }

  passwordMatchValidator(bankDetailsform: UntypedFormGroup) {
    return bankDetailsform.controls['accountNumber'].value === bankDetailsform.controls['confirmAccountNumber'].value ? null : { 'mismatch': true };
  }

  modifyBankDetails() {
    this.modalRef = this.modalService.open(this.removeBankDetails, { windowClass: 'upimobilemodal', size: 'md', centered: true, backdrop: 'static', keyboard: false });
    this.modalRef.result.then((res) => {
      if (res === 'ok') {
        this.bankVerificationType = '';
        this.dashboardService.removeBankDetails().subscribe((res: any) => {
          if (res?.success) {
            this.verifiedSteps['isBankAccountVerified'] = false;
            this.verifiedSteps['canEditBank'] = false;
            this.serviceVarService.setStepsInfo(this.verifiedSteps);
            this.bankVerificationForm = this.fb.group({
              bankVerificationType: new UntypedFormControl('upi', [ValidationService.required]),
            });
            this.global.successToastr(res?.message);
            this.modalRef.dismiss();
          } else {
            if (res?.message) {
              this.global.errorToastr(res?.message);
            } else {
              this.global.errorToastr('Data not found, please try again...')
            }
          }
        }, error => {
          this.global.errorToastr('Server Error Found, Please try again...')
        })

      }
    })
  }

  getBankDetails() {
    this.bankVerificationType = 'ifsc';
    this.bankVerificationForm.patchValue({ bankVerificationType: 'ifsc' });
    this.formValidationForIFSC();

    this.dashboardService.getBankDetails().subscribe((res: any) => {
      if (res.success) {
        if (res.result.ifsc_code) {
          this.bankDetailsform.patchValue({ IFSCCode: res.result.ifsc_code });
          const objParam = { 'ifsc_code': res.result.ifsc_code.toUpperCase() };
          this.dashboardService.searchBankeDetails(objParam).subscribe((respo: any) => {
            if (respo.success) {
              this.bankAddress = respo.result;
            } else {
              this.bankAddress = '';
            }
          });
        }
        if (res.result.account_number) {
          this.bankDetailsform.patchValue({ accountNumber: res.result.account_number });
        }
        if (res?.result?.account_type) {
          this.bankDetailsform.patchValue({ account_type: res?.result?.account_type });
        }
        // if (res.result.account_number) {
        //   this.bankDetailsform.patchValue({ confirmAccountNumber: res.result.account_number });
        // }
        this.bankDetailsform.get('accountNumber').clearValidators();
        this.bankDetailsform.get('accountNumber').updateValueAndValidity();
      } else {
        this.global.errorToastr(res.message);
        this.global.redirectToLastVerifiedPage(this.verifiedSteps);
      }
    });
  }

  /**
  * Submit form
  */
  onSubmit() {

    if (this.verifiedSteps.isBankAccountVerified) {
      if (this.global.checkForMFAPP(this.verifiedSteps)) {
        const type: string = 'declarations';
        this.router.navigate([type]);
        this.global.onActivate();
        this.serviceVarService.setActivePageInfoValue(type);
      } else {
        this.finishTheEKYC();
      }
    } else {
      if (!this.bankAddress) {
        this.global.errorToastr(this.translate.instant('IFSC_code_not_exists'));
      } else {
        if (!this.bankDetailsform.valid) {
          this.validate.validateAllFormFields(this.bankDetailsform);
          this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
        }
        let obj = {};
        obj['ifsc_code'] = this.bankDetailsform.value.IFSCCode.toUpperCase();
        obj['account_number'] = this.bankDetailsform.value.accountNumber;
        obj['account_type'] = this.bankDetailsform.value.account_type;
        // obj['confirm_account_number'] = this.bankDetailsform.value.confirmAccountNumber;
        this.global.globalLoaderMessage(this.translate.instant('bank_details_verify_loader_message'));
        this.global.logEventUserExperior("Submitted bank details");
        this.dashboardService.submitBankDetails(obj).subscribe((res: any) => {
          if (res.success) {
            /************************ GA TAG PUSH : START ********************/
            let utmSource = '';
            let utmMedium = '';
            this.global.setPushToGTM({
              'event': 'add_bank_success',
              'Page_Location': this.router.url.split('?')[0],
              'Page_referrer': this.global?.previousUrl,
              'CTA_text': 'Save & Continue',
              'FormID': 'form id',
              'user_id': `add_bank_success${Math.random()}`,
              'UTM_source': utmSource ? utmSource : '',
              'UTM_medium': utmMedium ? utmMedium : '',
            });
            /************************ GA TAG PUSH : STOP ********************/
            // this.serviceVarService.setBankInfoValue('');
            this.global.logEventUserExperior("Verified bank details");

            this.verifiedSteps['isBankAccountVerified'] = true;
            this.serviceVarService.setStepsInfo(this.verifiedSteps);
            this.dashboardService.getStepsInfo().subscribe((res) => {
              if (res.success) {
                this.serviceVarService.setStepsInfo(res.result);
              }
            });
            const type = 'declarations';
            this.global.successToastr(res.message);
            this.global.globalLoaderMessage();
            if (this.global.checkForMFAPP(this.verifiedSteps)) {
              this.global.redirectToPage(type);
            } else {
              this.finishTheEKYC();
            }
          } else {
            this.global.globalLoaderMessage();
            this.global.errorToastr(res.message);
            this.router.navigate(['bank-account-details']);
          }
        });

        // this.modalService.open(this.misMatchModal, { centered: true }).result.then((result) => {
        //   if (result === 'ok') {
        //     if (this.bankDetailsform.valid) {
        //       let obj = {};
        //       obj['ifsc_code'] = this.bankDetailsform.value.IFSCCode.toUpperCase();
        //       obj['account_number'] = this.bankDetailsform.value.accountNumber;
        //       obj['confirm_account_number'] = this.bankDetailsform.value.confirmAccountNumber;
        //       this.serviceVarService.setBankInfoValue(obj);
        //       this.router.navigate(['disclaimer']);
        //     } else {
        //       this.validate.validateAllFormFields(this.bankDetailsform);
        //       this.global.errorToastr('PLEASE_FILL_ALL_REQUIRED_FIELDS');
        //     }
        //   }
        // });
      }
    }
  }


  /************* FINISH EKYC: FUNCTIONING TO SUBMIT ***************/
  finishTheEKYC() {
    if (!this.verifiedSteps?.isBankAccountVerified) {
      const type: string = 'bank-account-details';
      this.global.errorToastr(this.translate.instant('verify_bank_details'));
      this.router.navigate([type]);
      this.global.onActivate();
      this.serviceVarService.setActivePageInfoValue(type);
    } else {
      this.dashboardService.finishEKYC().subscribe((res: any) => {
        if (res.success) {
          if (res.result.is_all_step_completed && res.result.is_email_verified) {
            this.verifiedSteps.isEKYCComplete = 1;
            this.global.successToastr(res.message);
            this.router.navigate(['thank-you']);
          } else if (res.result.is_all_step_completed && !res.result.is_email_verified) {
            this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
          } else if (!res.result.mf_app) {
            const GolpAppToken = res?.result?.token;
            const redirectUrl = `${environment.golapp}/loginWithToken/${GolpAppToken}`;
            window.location.href = redirectUrl;
          }
        } else {
          this.global.errorToastr(this.translate.instant('verify_bank_details'));
        }
      }, error => {
        this.global.errorToastr(this.translate.instant('something_went_wrong'));
      });
    }
  }

  /**
   * verify email before submit ekyc
   */
  resendVerifyEmail() {
    this.dashboardService.resendVerificationEmail().subscribe((res: any) => {
      if (res.success) {
        this.global.successToastr(res.message);
        this.modalRef.close();
      } else {
        this.global.errorToastr(res.message);
        this.modalRef.close();
      }
    }, error => {
      this.modalRef.close();
    })
  }

  /**
   * submit aadhar upload and then close
   */
  cancelModal($event) {
    this.modalRef.close();
  }

  ifscModalOption() {
    this.modalRef = this.modalService.open(this.ifscModal, { centered: true, backdrop: 'static', keyboard: false });
    this.modalRef.result.then((res) => {
      // console.log('res', res);
      this.modalRef.dismiss();
      if (res === 'ok') {
        // this.findIfsc();
      }
    })
  }
  findIfscCode() {
    this.findIFSCForm = this.fb.group({
      bank_name: new UntypedFormControl('', [ValidationService.required]),
      bank_state: new UntypedFormControl('', [ValidationService.required]),
      bank_district: new UntypedFormControl('', [ValidationService.required]),
      bank_branch: new UntypedFormControl('', [ValidationService.required]),
    });
    this.modalRefIFSC = this.modalService.open(this.findIfscModal, { centered: true, backdrop: 'static', keyboard: false });
    this.modalRefIFSC.result.then((res: any) => {
      if (res === 'ok' && this.ifscSearchBankDetails) {
        // console.log('dev', this.ifscSearchBankDetails)
        this.bankDetailsform.patchValue({ IFSCCode: this.ifscSearchBankDetails?.ifsc });
        this.searchBankDetails(this.ifscSearchBankDetails?.ifsc)
      }
    })
  }

  getBankMasterList() {
    let queryStr = `type=search`;

    // queryStr += `bank_name=${}`;
    // &state=&district=&branch=

    this.dashboardService.getBankMaster(queryStr).subscribe((res: any) => {
      if (res.status) {
        if (res?.data?.bank_names) {
          this.bankMasterArray = res?.data?.bank_names;
          this.bankMasterArray.sort();
        }
      } else {
        this.bankMasterArray = [];
      }
    }, error => {
      this.bankMasterArray = [];
    })
  }

  bankMasterArray = [];
  bankStateArray = [];
  bankDistrictsArray = [];
  bankBranchesArray = [];
  ifscSearchBankDetails: any;
  onChangeBank($event: any) {
    // console.log($event.target.value);
    let queryStr = `type=search`;
    if (this.findIFSCForm.value.bank_name) {
      queryStr += `&bank_name=${this.findIFSCForm.value.bank_name}`;
    }
    if (this.findIFSCForm.value.bank_state) {
      queryStr += `&state=${this.findIFSCForm.value.bank_state}`;
    }
    if (this.findIFSCForm.value.bank_district) {
      queryStr += `&district=${this.findIFSCForm.value.bank_district}`;
    }
    if (this.findIFSCForm.value.bank_branch) {
      queryStr += `&branch=${this.findIFSCForm.value.bank_branch}`;
    }
    // type=search&bank_name=&state=&district=&branch=
    this.dashboardService.getBankMaster(queryStr).subscribe((res: any) => {
      if (res.status) {
        if (res?.data?.states) {
          this.bankStateArray = res?.data?.states;
          this.bankStateArray.sort()
        }
        if (res?.data?.districts) {
          this.bankDistrictsArray = res?.data?.districts;
          this.bankDistrictsArray.sort()
        }
        if (res?.data?.branches) {
          this.bankBranchesArray = res?.data?.branches;
          this.bankBranchesArray.sort()
        }
        if (res?.data?.banks.length) {
          this.ifscSearchBankDetails = res?.data?.banks[0];
        }
      }
    }, error => {

    })
  }


}
