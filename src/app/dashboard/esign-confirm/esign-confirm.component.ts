import { environment } from 'src/environments/environment';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EsignService } from 'src/app/esign-flow/esign.service';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { DashboardService } from '../dashboard.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
declare var $: any;
import { saveAs } from 'file-saver';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-esign-confirm',
  templateUrl: './esign-confirm.component.html',
  styleUrls: ['./esign-confirm.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule]
})
export class EsignConfirmComponent implements OnInit, OnDestroy {
  @Output() restartPopUpEvent = new EventEmitter<any>();
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;
  @Input() commonConfigFlow: any;

  confirmEsignDetailsContent: any;
  @ViewChild('esignPdf') esignPdf: any;
  @ViewChild('esignForm') esignForm: any;
  @ViewChild('emailNotVerify') emailNotVerify: any;
  private modalRef: NgbModalRef;
  esignPdfUrl: any;
  isEligibleEsign: boolean;
  esignValidations: any;
  isLoading = true;
  esignActionUrl = environment.esignActionUrl;
  isEmailVerified: boolean;
  emailData: any;
  rejectreason: any;
  dataSubscription: Subscription;
  constructor(
    private ref: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public global: GlobalService,
    private serviceVarService: SharedVarService,
    private dashboardService: DashboardService,
    private modalService: NgbModal,
    private esignService: EsignService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platform: Object,
  ) {
    this.isLoading = true;
  }
  documentId: any;
  windowHeight: any;
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['documentId']) {
        this.documentId = params['documentId'];
        this.updateOnLegality(params['documentId']);
      }
    })
    if (!this.global.checkForMFAPP(this.verifiedSteps)) {
      this.navigate('address-details');
    }
    if (this.contentData?.data) {
      const data = JSON.parse(this.contentData?.data);
      this.confirmEsignDetailsContent = data?.confirm_esign_content;
    }
    this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.confirmEsignDetailsContent = data?.confirm_esign_content;
      }
    });

    if (this.verifiedSteps.mf_app) {
      if (this.verifiedSteps.hasOwnProperty('isNominatedVerified') && !this.verifiedSteps?.isNominatedVerified) {
        setTimeout(() => {
          this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
        }, 500);
      } else {
        if (this.verifiedSteps.hasOwnProperty('isDocumentUploaded') && !this.verifiedSteps?.isDocumentUploaded) {
          this.ref.detectChanges();
          setTimeout(() => {
            this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
          }, 500);
        } else if (this.verifiedSteps.hasOwnProperty('isEmailVerified') && !this.verifiedSteps?.isEmailVerified) {
          this.global.errorToastr('Please verify email before esign.');
          this.serviceVarService.setActivePageInfoValue('documents-upload');
          this.router.navigate(['documents-upload']);
          this.global.onActivate();
        } else {
          this.global.logEventUserExperior(`Landing on Esign Confirm Step`);
          // this.serviceVarService.getEsignPdfData().subscribe((res: any) => {
          //   if (res) {
          //     this.esignPdfUrl = res;
          //   } else {
          if (!this.documentId) {
            this.getEsignPdfDocument();
          }
          //   }
          // });
        }
      }

    } else {
      this.global.redirectToLastVerifiedToastrGold(this.verifiedSteps);
    }

    const numbers = interval(1000 * 60 * environment.autoRefresh);
    const takeNumbers = numbers.pipe(take(10));
    this.dataSubscription = takeNumbers.subscribe(x => {
      this.getStepInfo();
    });

  }

  // @HostListener('window:resize', ['$event'])
  // onResize() {
  //   this.windowHeight = window.innerWidth;
  // }

  updateOnLegality(documentId: any) {
    // this.route.queryParams.subscribe(params => {
    //   if (params['documentId']) {
    this.dashboardService.verifyDocumentIdEsign(documentId).subscribe((res: any) => {
      if (res.success) {
        /************************ GA TAG PUSH : START ********************/
        this.global.setPushToGTM({
          'event': 'Esign_success',
          'Page_Location': this.router.url.split('?')[0],
          'Page_referrer': this.global?.previousUrl,
          'CTA_text': 'Esign',
          'FormID': 'form id',
          'user_id': `Esign_success${Math.random()}`,
          'UTM_source': '',
          'UTM_medium': '',
        });
        this.global.setPushToGTM({
          'event': 'account_opening_complete_success',
          'Page_Location': this.router.url.split('?')[0],
          'Page_referrer': this.global?.previousUrl,
          'CTA_text': 'On Thanks you page landing',
          'FormID': 'form id',
          'user_id': `account_opening_complete_success${Math.random()}`,
          'UTM_source': '',
          'UTM_medium': '',
        });
        /************************ GA TAG PUSH : STOP ********************/
        if (this.verifiedSteps?.is_boat_user && this.verifiedSteps?.isBeta) {
          window.location.href = `${environment?.mobileEsignReturnUrl}?success=1&message="Esign Successfully`;
          return;
        }
        this.router.navigate(['thank-you']);
      } else {
        if (this.verifiedSteps?.is_boat_user && this.verifiedSteps?.isBeta) {
          window.location.href = `${environment?.mobileEsignReturnUrl}?success=0&message="Esign Failed`;
          return;
        }
      }
    })
    //   }
    // });
  }

  getStepInfo() {
    this.dashboardService.getStepsInfo().subscribe((res) => {
      if (res.success) {
        this.serviceVarService.setStepsInfo(res?.result);
        this.verifiedSteps = res?.result;
        if (res?.result.adminApproval === 'Approved' && !this.documentId) {
          this.getEsignPdfDocument();
        }
      }
    })
  }

  /**
   * Get esign pdf
   */
  getEsignPdfDocument() {

    this.dashboardService.submitDocumentUpload().subscribe((res: any) => {
      if (res.success) {

        this.isLoading = false;
        this.verifiedSteps['isDocumentUploaded'] = true;
        this.serviceVarService.setStepsInfo(this.verifiedSteps);
        this.isEmailVerified = true;
        if (res?.result?.esignUrl) {
          this.esignPdfUrl = res?.result?.esignUrl;
          // this.serviceVarService.setEsignPdfData(res?.result?.esignUrl);
        }
        this.esignValidations = res?.result;
        if (res?.result?.is_eligible_esign) {
          this.isEligibleEsign = true;
        }
        if (res?.result?.rejectreason) {
          this.rejectreason = res?.result?.rejectreason;
        }

      } else {
        this.isLoading = false;
        if (!res?.result?.isDocumentUploaded) {
          this.global.errorToastr(this.translate.instant('Upload_All_Documents'));
          this.serviceVarService.setActivePageInfoValue('documents-upload');
          this.router.navigate(['documents-upload']);
          this.global.onActivate();
        } else if (!res?.result?.isEmailVerified) {
          // if (res?.message) {
          //   this.global.errorToastr(res?.message);
          // }
          this.isEmailVerified = false;
          this.emailData = res.result;
          this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
        } else if (res?.message) {
          this.global.errorToastr(res?.message);
        }
      }
    });
  }

  navigate(type: string) {
    this.router.navigate([type]);
    this.global.onActivate();
    this.serviceVarService.setActivePageInfoValue(type);
  }

  getEsignPdf() {
    console.log('this.esignPdfUrl', this.esignPdfUrl);
    saveAs(this.esignPdfUrl, 'filename');
    // this.modalRef = this.modalService.open(this.esignPdf, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  closePdf() {
    this.modalRef.close();
  }

  isEsign = true;
  isEsignXmlData: any;
  /**
   * Decode file
   * @param input 
   * @returns 
   */
  decode(input) {
    if (/&amp;|&quot;|&#39;|'&lt;|&gt;/.test(input)) {
      const doc = new DOMParser().parseFromString(input, "text/html");
      return doc.documentElement.textContent;
    }
    return input;
  }

  /************* FINISH EKYC: FUNCTIONING TO SUBMIT ***************/
  finishTheEKYC() {
    if (!this.verifiedSteps?.isDocumentUploaded) {
      this.global.redirectToLastVerifiedToastr(this.verifiedSteps)
    } else {
      this.dashboardService.finishEKYC().subscribe((res: any) => {
        if (res.success) {
          if (res?.result?.is_all_step_completed && res?.result?.is_email_verified && res?.result?.isEKYCComplete) {
            this.verifiedSteps.isEKYCComplete = 1;
            // this.global.successToastr(res?.message);
            if (res?.result?.esignToken) {
              setTimeout(() => {
                this.tokenCheckForEsign(res?.result?.esignToken);
              }, 1000);
              // this.router.navigate(['esign', res.result.esignToken]);
            }
          } else if (res.result.is_all_step_completed && !res.result.is_email_verified) {
            this.emailData = res.result;
            this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
          } else if (!res.result.is_document_uploaded) {
            this.global.errorToastr(this.translate.instant('Upload_All_Documents'));
          }
        } else {
          this.global.errorToastr(this.translate.instant('Upload_All_Documents'));
        }
      });
    }
  }

  verifyEmail() {
    this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
  }

  tokenCheckForEsign(esignToken: any) {
    this.global.globalLoaderMessage('creating Esign file...');
    this.esignService.validateEsignProcess(esignToken).subscribe((esignData: any) => {
      if (esignData.success) {
        // console.log('this.commonConfigFlow', this.commonConfigFlow); return;
        this.global.globalLoaderMessage();
        if (this.commonConfigFlow?.esign_provider === 'LEGALITY' && esignData?.result?.esignUrl) {

          /************************ GA TAG PUSH : START ********************/
          let utmSource = '';
          let utmMedium = '';
          this.global.setPushToGTM({
            'event': 'continue_to_esign',
            'Page_Location': this.router.url.split('?')[0],
            'Page_referrer': this.global?.previousUrl,
            'CTA_text': 'Continue to Esign',
            'FormID': 'form id',
            'user_id': `continue_to_esign${Math.random()}`,
            'UTM_source': utmSource ? utmSource : '',
            'UTM_medium': utmMedium ? utmMedium : '',
          });
          /************************ GA TAG PUSH : STOP ********************/
          this.global.logEventUserExperior(`Redirecting on legality to Esign`);
          window.location.href = esignData?.result?.esignUrl;
          // console.log('LEGALITY'); return;
        } else if (this.commonConfigFlow?.esign_provider === 'NSDL' && esignData?.result?.response) {
          this.isEsign = true;
          //  esignData.result.response;
          this.isEsignXmlData = this.decode(esignData.result.response);
          setTimeout(() => {
            /************************ GA TAG PUSH : START ********************/
            let utmSource = '';
            let utmMedium = '';
            this.global.setPushToGTM({
              'event': 'continue_to_esign',
              'Page_Location': this.router.url.split('?')[0],
              'Page_referrer': this.global?.previousUrl,
              'CTA_text': 'Submit',
              'FormID': 'form id',
              'user_id': `continue_to_esign${Math.random()}`,
              'UTM_source': utmSource ? utmSource : '',
              'UTM_medium': utmMedium ? utmMedium : '',
            });
            /************************ GA TAG PUSH : STOP ********************/
            this.global.logEventUserExperior(`Redirecting on NSDL to Esign`);
            $("#URL").submit();
            // this.esignForm.submit();
          }, 500);
        }
      } else {
        this.global.globalLoaderMessage();
        if (esignData?.message) {
          this.global.errorToastr(esignData?.message);
        } else {
          this.global.errorToastr(this.translate.instant('ESIGN_PROCESS_NOT_VALID'));
        }
      }
    }, error => {
      if (error?.error?.message) {
        this.global.errorToastr(error?.error?.message);
      }
    });
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
   * Re-Submit EKYC Data
   */
  reSubmitEKYCData() {
    if (!this.verifiedSteps?.isDocumentUploaded) {
      this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
    } else {
      this.dashboardService.reSubmitEKYCData().subscribe((res: any) => {
        if (res.success) {
          this.getEsignPdfDocument();
          this.verifiedSteps['adminApproval'] = 'NOT Eligible For Esign';
          this.serviceVarService.setStepsInfo(this.verifiedSteps);
        } else {
          this.global.errorToastr(this.translate.instant('Upload_All_Documents'));
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }

}
