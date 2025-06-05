import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { DashboardService } from '../dashboard.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/shared/customeAdapter';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDatepickerConfig, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WebcamImage, WebcamInitError, WebcamModule } from 'ngx-webcam';
import { Subject, Subscription } from 'rxjs';
import { FileItem, FileUploader, FileUploadModule, ParsedResponseHeaders } from 'ng2-file-upload';
import { ImageCroppedEvent, ImageCropperModule, ImageTransform } from 'ngx-image-cropper';
// import { CookiesService } from '@ngx-utils/cookies';
import { Observable } from 'rxjs-compat';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, NgbModule, ControlMessagesComponent, ImageCropperModule, WebcamModule, FileUploadModule, NgxMaskDirective, NgxMaskPipe]
})
export class PersonalDetailsComponent implements OnInit {

  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;

  personalDetailsContent: any;
  public personalDetailsform: UntypedFormGroup;
  OccupationTypeArray: any[];
  IncomeRangeArray: any[];
  educationArray: any[];
  perAddress: boolean;
  permanentAddress: any;
  stateList: any;
  cityList: any;
  cor_stateList: any;
  cor_cityList: any;
  addAddress1: boolean;
  showPerAddrress: boolean = false;
  checked: boolean = true;
  public addressDetailsform: UntypedFormGroup;
  public cor_addressDetailsform: UntypedFormGroup;
  tradingExp = [{ lable: 'Less than 1 yr', 'id': '1' }, { lable: '1-2 yrs.', id: '2' },
  { lable: '2-5 yrs.', 'id': '3' }, { lable: '5-10 yrs.', 'id': '4' }, { lable: '10-20 yrs.', 'id': '5' }
    , { lable: '20-25 yrs.', 'id': '6' }, { lable: 'More than 25', 'id': '7' }];

  // Create PDF
  cols: Array<any> = [{
    title: "Details",
    dataKey: 'details'
  }, {
    title: "Values",
    dataKey: 'values'
  }];
  rows: Array<any> = [];

  /******** webcame: START *******/
  liveWebcam = false;
  webCamMediaPriview: any;
  webCamMediaList: any = [];
  /******** webcame: END *******/

  /*******************  webcam code initialize: START ***************/
  public showWebcam = true;
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: { min: 1280, ideal: 1920 },
    // height: { min: 720, ideal: 1080 }
    height: { ideal: 316 }
  };

  public errors: WebcamInitError[] = [];
  // latest snapshot
  public webcamImage: WebcamImage = null;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  clickedWebcamPicture = false;
  /*******************  webcam code initialize: END ***************/
  /********************** IMAGE/FILE UPLOAD: START **********************/
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  response: string;
  addNewAadhaarImageUpload = true;
  uploadProgress = 0;

  public allowedMimeType = ['image/png'];
  public altMedia = [];
  public mediaPreviews = [];
  public mediaImages = [];
  aadharDisplayImage: any;
  maxUploadLimit = 2;
  totalUploadLimit: any;

  viewSectionOfImage: boolean;
  viewPreviewDisplayImage: any;
  viewMediaPreviewsList: any;
  getPreviewDisplayImage: any;

  private modalRef: NgbModalRef;
  nameOfTitleDocument: any;
  nameOfDocument: any;
  isDocumentVerified: any;
  isContentTypePdf: boolean;
  /********************** IMAGE/FILE UPLOAD: END **********************/
  loader: boolean;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  latitude: any;
  longitude: any;
  getDocumentAvailableList: any[] = [];
  fileUploading: boolean;
  @ViewChild('fileuploadAadharpopup') fileuploadAadharpopup: any;


  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    public validate: ValidationService,
    public dashboardService: DashboardService,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    public translate: TranslateService,
    config: NgbDatepickerConfig,
    private cookie: CookieService,
    private ref: ChangeDetectorRef,
    private modalService: NgbModal
  ) {
    const currentDate = new Date();
    config.minDate = { year: 1930, month: 1, day: 1 };
    config.maxDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    config.outsideDays = 'hidden';
  }

  ngOnInit(): void {
    setTimeout(async () => {
      if (this.verifiedSteps && this.verifiedSteps.isApproved) {
        this.global.checkIsApplicationApprove(this.verifiedSteps); return;
      }
    }, 500);
    this.setFormValidation();
    this.isAccessibleNav();
    if (this.contentData?.data) {
      const data = JSON.parse(this.contentData?.data);
      this.personalDetailsContent = data?.personal_details_content;
    }
    this.sharedVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.personalDetailsContent = data?.personal_details_content;
      }
    });
    // console.log(this.tradingExp);
  }

  /**
   * Set form validation
   */
  setFormValidation() {
    const requiredName = new UntypedFormControl('');
    const requiredFahterValidate = new UntypedFormControl('', [ValidationService.required, ValidationService.onlyAlphabeticAllow]);
    const requiredMotherValidate = new UntypedFormControl('', [ValidationService.required, ValidationService.onlyAlphabeticAllow]);
    const requiredSelection = ['', Validators.required];
    this.personalDetailsform = this.fb.group({
      // name: '',
      gender: '',
      dob: '',
      marital_status: requiredSelection,
      occupation_type: requiredSelection,
      income_range: requiredSelection,
      education_type: requiredSelection,
      // politicallyExp: false,
      // isResidencyOfIndia: true,
      tradingExp: requiredSelection,
      father_spouse_name: requiredFahterValidate,
      mother_name: new UntypedFormControl('', [ValidationService.onlyAlphabeticAllowMother]),
      radio: new UntypedFormControl(null)
    });
  }

  isNomineeAvailable: boolean;
  /**
   * Switch to nominee details add OR Skip it
   */
  switchToNominee() {
    this.isNomineeAvailable = !this.isNomineeAvailable;
  }

  /**
   * validate navigation
   */
  isAccessibleNav() {
    // console.log('this.verifiedSteps', this.verifiedSteps);
    if (this.verifiedSteps.hasOwnProperty('isPanVerified') && !this.verifiedSteps?.isPanVerified && !this.verifiedSteps?.isKRAVerified && !this.verifiedSteps?.isDigiLockerVerified) {
      setTimeout(() => {
        this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
      }, 500);
      // this.global.errorToastr("Please verify PAN details");
      // this.global.onActivate();
      // setTimeout(() => {
      //   this.sharedVarService.setActivePageInfoValue('welcome');
      // }, 500);
      // this.router.navigate(['welcome']);
    }
    else {
      this.global.logEventUserExperior("Landing On Personal Details Screen");
      setTimeout(() => {
        if (this.verifiedSteps.hasOwnProperty('isPanVerified') && !this.verifiedSteps?.isPanVerified && !this.verifiedSteps?.isUsedDigiLocker) {
          this.personalDetailsform.get('name').setValidators([Validators.required]);
          this.personalDetailsform.get('name').updateValueAndValidity();
          this.personalDetailsform.get('gender').setValue('');
          this.personalDetailsform.get('gender').setValidators([Validators.required]);
          this.personalDetailsform.get('gender').updateValueAndValidity();
        } else if (this.verifiedSteps.hasOwnProperty('isPanVerified') && this.verifiedSteps?.isPanVerified && !this.verifiedSteps?.isKRAVerified) {
          setTimeout(() => {
            this.personalDetailsform.get('dob').setValidators([ValidationService.required, ValidationService.dobValidator, ValidationService.AgeValidator]);
            this.personalDetailsform.get('dob').updateValueAndValidity();
          }, 1000);
        }
      }, 1000);
      this.getPersonalDetails();
    }
  }


  onChangeMaritalStatus($event: any) {
    if (this.personalDetailsform.value.gender?.toUpperCase() === 'FEMALE' && $event.target.value === 'Married') {
      this.lableOfFatherHusban = `Husband's Name`;
    } else {
      this.lableOfFatherHusban = `Father's Name`;
    }
  }
  lableOfFatherHusban = `Father’s/Husband’s Name`;
  /**
   * get personal details
   */
  getPersonalDetails() {
    if (this.verifiedSteps?.isOCRRequired) {
      this.getKYCDocumentsList();
    }

    this.dashboardService.getPersonalDetails().subscribe((res) => {
      if (res.success) {
        if (res.result.fullName) {
          const name = res.result.fullName.toLowerCase();
          const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
          this.personalDetailsform.patchValue({ name: nameCapitalized });
        }
        if (res.result.gender) {
          this.personalDetailsform.patchValue({ gender: res.result.gender.toUpperCase() });
        }
        if (res.result.dateOfBirth) {
          const dob = res.result.dateOfBirth.replace(/-/g, "/");
          this.personalDetailsform.patchValue({ dob: dob });
        }
        if (res.result.marital_status) {
          this.personalDetailsform.patchValue({ marital_status: res.result.marital_status });
        }
        if (res?.result?.gender?.toUpperCase() === 'FEMALE' && res?.result?.marital_status === 'Married') {
          this.lableOfFatherHusban = `Husband's Name`;
        } else {
          this.lableOfFatherHusban = `Father's Name`;
        }
        if (res?.result?.mother_name) {
          const mother_name = res.result.mother_name.toLowerCase();
          const motherNameCapitalized = mother_name.charAt(0).toUpperCase() + mother_name.slice(1);
          this.personalDetailsform.patchValue({ mother_name: motherNameCapitalized });
        }
        if (res.result.father_spouse_name) {
          const father_spouse_name = res.result.father_spouse_name.toLowerCase();
          const fatherSpouseNameCapitalized = father_spouse_name.charAt(0).toUpperCase() + father_spouse_name.slice(1);
          this.personalDetailsform.patchValue({ father_spouse_name: fatherSpouseNameCapitalized });
        }
        this.personalDetailsform.patchValue({ tradingExp: this.tradingExp[1]?.id });
        if (res.result.tradingExp) {
          this.personalDetailsform.patchValue({ tradingExp: res.result.tradingExp });
        }
        // if ("isResidencyOfIndia" in res.result) {
        //   this.personalDetailsform.patchValue({ isResidencyOfIndia: res.result.isResidencyOfIndia });
        // }
        // if (res.result.politicallyExp) {
        //   this.personalDetailsform.patchValue({ politicallyExp: res.result.politicallyExp });
        // } else {
        //   this.personalDetailsform.patchValue({ politicallyExp: false });
        // }
        if (res?.result?.occupations) {
          this.OccupationTypeArray = res.result.occupations;
          this.personalDetailsform.patchValue({ occupation_type: this.OccupationTypeArray[3]?.id });
        }
        if (res?.result?.occupation_type) {
          this.personalDetailsform.patchValue({ occupation_type: res?.result?.occupation_type });
        }
        if (res?.result?.incomes) {
          this.IncomeRangeArray = res.result.incomes;
          this.personalDetailsform.patchValue({ income_range: this.IncomeRangeArray[1]?.id });
        }
        if (res?.result?.income_range) {
          this.personalDetailsform.patchValue({ income_range: res.result.income_range });
        }
        if (res?.result?.educations) {
          this.educationArray = res.result.educations;
          this.personalDetailsform.patchValue({ education_type: this.educationArray[1]?.id });
        }
        if (res?.result?.educationId) {
          this.personalDetailsform.patchValue({ education_type: res.result.educationId });
        }

        if (res?.result?.isNomineeSkiped) {
          this.isNomineeAvailable = false;
        } else {
          this.isNomineeAvailable = true;
        }

        this.perAddress = false;
        this.permanentAddress = res?.result?.userAddressData;
      }
      // else {
      //   this.global.errorToastr(res.message);
      //   this.global.redirectToLastVerifiedPage(this.verifiedSteps);
      // }
    });

  }

  /**
   * Get address details
   */
  getAddressDetails() {
    this.global.globalLoader(true);
    this.dashboardService.getAddressDetails().subscribe((res) => {
      if (res.success) {
        this.global.globalLoader(false);
        this.perAddress = false;
        this.permanentAddress = res.result;
      } else {
        if (!this.verifiedSteps.ispersonalDetailsVerified && this.global.checkForMFAPP(this.verifiedSteps)) {
          this.global.errorToastr(res.message);
          this.global.redirectToLastVerifiedPage(this.verifiedSteps);
        }
        if (!this.verifiedSteps.isPanVerified) { // if aadhar not verified by KRA,Digilocker
          this.perAddress = true;
        }
      }
    });
  }


  /**
  * Submit form 
  */
  onSubmit() {
    if (this.personalDetailsform.valid) {
      const obj = {
        gender: this.personalDetailsform.value.gender,
        marital_status: this.personalDetailsform.value.marital_status,
        occupation_type: this.personalDetailsform.value.occupation_type,
        income_range: this.personalDetailsform.value.income_range,
        father_spouse_name: this.personalDetailsform.value.father_spouse_name,
        mother_name: this.personalDetailsform.value.mother_name,
        tradingExp: this.personalDetailsform.value.tradingExp,
        education_type: this.personalDetailsform.value.education_type
        // politicallyExp: this.personalDetailsform.value.politicallyExp,
        // isResidencyOfIndia: this.personalDetailsform.value.isResidencyOfIndia
      };
      // if (!this.verifiedSteps?.isPanVerified) {
      //   obj['full_name'] = this.personalDetailsform.value.name;
      // }
      obj['same_as_parmanent'] = true;
      if (this.verifiedSteps?.isPanVerified && !this.verifiedSteps?.isKRAVerified) {
        obj['dob'] = this.personalDetailsform.value.dob;
      }
      obj['isNomineeSkiped'] = true;
      if (this.isNomineeAvailable) {
        obj['isNomineeSkiped'] = false;
      }
      this.dashboardService.addPersonalDetails(obj).subscribe((res: any) => {
        if (res.success) {
          this.global.logEventUserExperior("Submitted personal details");
          this.global.successToastr(res.message);
          this.verifiedSteps['ispersonalDetailsVerified'] = true;
          this.verifiedSteps['isAddressVerified'] = true;
          if (!this.verifiedSteps.isAddressVerified && this.verifiedSteps.isKRAVerified) {
            this.createPdf(this.permanentAddress);
          }
          this.sharedVarService.setStepsInfo(this.verifiedSteps);
          this.dashboardService.getStepsInfo().subscribe((res) => {
            if (res.success) {
              this.sharedVarService.setStepsInfo(res.result);
              this.verifiedSteps = res.result;
            }
          });
          // this.addAddress();
          // this.global.redirectToPage('nominee-details');
          if (this.isNomineeAvailable) {
            this.verifiedSteps['isNomineeSkiped'] = false;
            if (this.verifiedSteps?.isNominatedVerified) {
              this.verifiedSteps['isNominatedVerified'] = true;
            } else {
              this.verifiedSteps['isNominatedVerified'] = false;
            }
            // console.log('verifiedSteps', this.verifiedSteps);
            this.global.redirectToPage('nominee-details');
          } else {
            this.verifiedSteps['isNominatedVerified'] = true;
            this.verifiedSteps['isNomineeSkiped'] = true;
            this.global.redirectToPage('bank-account-details');
          }
        } else {
          this.global.errorToastr(res.message);
        }
      });
    } else {
      this.validate.validateAllFormFields(this.personalDetailsform);
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
    }

  }

  addAddress() {
    let obj = {};
    obj = { same_as_parmanent: true };
    this.dashboardService.addAddressDetails(obj).subscribe((res: any) => {
      if (res.success) {
        this.global.successToastr(res.message);
        this.verifiedSteps['isAddressVerified'] = true;
        this.sharedVarService.setStepsInfo(this.verifiedSteps);
        this.dashboardService.getStepsInfo().subscribe((res) => {
          if (res.success) {
            this.sharedVarService.setStepsInfo(res.result);
            this.verifiedSteps = res.result;
          }
        });
        // this.global.redirectToPage('nominee-details');
      } else {
        this.global.errorToastr(res.message);
      }
    });
  }

  /*************** Create PDF/BLOB: START *****************/
  optionsContainer = {
    base: {},
    horizontal: {
      drawHeaderRow: () => false,
      columnStyles: {
        details: { fontStyle: 'bold' }
      },
      margin: { top: 25 }
    }
  };

  createPdf(extraData: any = '') {
    let arrayOfData = {};
    arrayOfData['Address line 1'] = extraData?.address_line1 || '';
    arrayOfData['Address line 2'] = extraData?.address_line2 || '';
    // arrayOfData['Address line 3'] = extraData?.address_line3 || '';
    arrayOfData['City'] = extraData?.city || '';
    arrayOfData['State'] = extraData?.state || '';
    arrayOfData['Pin Code'] = extraData?.pin_code || '';
    arrayOfData['Country'] = extraData?.country || '';

    this.rows = Object.keys(arrayOfData).map((key) => {
      return { 'details': key, 'values': arrayOfData[key] };
    });

    let docs: any = new jsPDF();
    docs.setFontSize(18);
    docs.text('Permanent Address Proof', 15, 15);
    docs.autoTable(this.cols, this.rows, this.optionsContainer['horizontal']);
    // Open PDF document in new tab
    var blob = docs.output('blob');
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', 'permanent_address');
    uploadParam.append('file[]', blob, 'permanent.pdf');
    uploadParam.append('isKRAVerified', true);
    // uploadParam.append('files', queue);
    this.dashboardService.uploadDocument(uploadParam).subscribe((res: any) => {
      // console.log('res', res);
    });
    // Download PDF document  
    // docs.save('table.pdf');
  }
  /*************** Create PDF/BLOB: END *****************/


  whatsAppRedirect() {
    window.location.href = `https://api.whatsapp.com/send?phone=7869755386`;
  }



  /***************************** CROPING START ********************************/
  canvasRotation = 0;
  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }
  transform: ImageTransform = {};
  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  mimeErrorStatement = [];
  valieMimeTypeArray() {
    let mimeErrorStatement = [];
    this.allowedMimeType.map((item) => {
      const mimeDisplyError = item.split("/");
      mimeErrorStatement.push(mimeDisplyError[1]);
    });
  }

  fileChangeEvent(event: any) {
    const isValidMimeTypeCheck = this.allowedMimeType.includes(event.target.files[0].type);
    if (!isValidMimeTypeCheck) {
      if (this.mimeErrorStatement.length) {
        this.global.errorToastr(`Please upload ${this.mimeErrorStatement.join(", ")} only.`);
      } else {
        this.global.errorToastr(`Please upload valid Image/file.`);
      }
      return;
    }

    if (this.maxUploadLimit === this.mediaPreviews.length) {
      this.global.errorToastr(`You can't upload more than ${this.maxUploadLimit} files.`);
      return;
    }

    // if (this.nameOfDocument === 'signature') { // for signature image upload restrict upto 15kb
    //   const maxSizeKB = 15; //Size in KB
    //   const maxSize = maxSizeKB * 1024;
    //   if (event.target.files[0].size > maxSize) {
    //     this.global.errorToastr(`You can't upload more than ${maxSizeKB}KB files.`);
    //     return;
    //   }
    // }
    if (event.target.files[0].type === 'application/pdf') {
      // console.log('event.target.files[0].size', event.target.files[0].size);
      if (Number(event.target.files[0].size) <= 2000000) {
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]); // read file as data url
        reader.onload = async (events: any) => {
          this.mediaPreviews.push({ file: events.target.result, contentType: 'application/pdf' });
        }
        setTimeout(() => {
          this.addNewAadhaarImageUpload = false;
          this.documentShowBigMedia(this.mediaPreviews.length - 1);
        }, 1000);
      } else {
        this.global.errorToastr(`You can't upload more than 2 MB file size.`); return;
      }
    } else {
      this.imageChangedEvent = event;
    }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    // console.log('test', this.croppedImage); return;
  }
  imageLoaded(image: any = '') {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  canvasRotateReset() {
    this.canvasRotation = 0;
  }

  confirmCropped() {
    this.mediaPreviews.push({ file: this.croppedImage, contentType: 'image/png' });
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.canvasRotateReset();
    this.addNewDocumentImage();
    if (this.mediaPreviews?.length) {
      this.documentShowBigMedia(0, true)
    }
  }

  testAddNewDocumentImage() {
    this.uploader.progress = 0;
    this.addNewAadhaarImageUpload = true;
    this.clickedWebcamPicture = false;
    this.viewSectionOfImage = false;
    this.viewMediaPreviewsList = [];
    this.viewPreviewDisplayImage = '';
    this.canvasRotateReset();
  }

  cancelCropped() {
    this.mediaPreviews.pop();
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.canvasRotateReset();
    this.addNewDocumentImage();
  }

  /**
   * Remove image preview
   */
  removeEditMedia(name: any) {
    this.addNewAadhaarImageUpload = true;
    this.mediaPreviews = this.mediaPreviews.filter((val, i) => {
      if (val.file != name) {
        return val;
      };
    });
  }

  /**
   * Submit image/file to upload document
   */
  submitDocumentUploadModalCropped() {
    this.canvasRotateReset();
    if (this.isDocsProofRequired && !this.isDocsDropDownSelected) {
      this.global.errorToastr('Please select type of document.'); return;
    }
    let realImageBlob = [];
    this.mediaPreviews.map((item: any) => {
      const blobImage = this.appendFileAndSubmit(item.file);
      realImageBlob.push(blobImage);
    })

    // const queue = [];
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', this.nameOfDocument);
    realImageBlob.map((item: any, index) => {
      // console.log('item', item);
      if (item.type === 'image/png') {
        uploadParam.append('file[]', item, `${this.nameOfDocument}${index}.png`);
      } else if (item.type === 'application/pdf') {
        uploadParam.append('file[]', item, `${this.nameOfDocument}${index}.pdf`);
      } else {
        uploadParam.append('file[]', item, `${this.nameOfDocument}${index}.jpeg`);
      }
    });

    // uploadParam.append('files', queue);
    this.fileUploadingProcessStarting();
    this.dashboardService.uploadDocument(uploadParam).subscribe((result: any) => {
      if (result.type === 1 && result.loaded && result.total) {
        const percentDone = Math.round(100 * result.loaded / result.total);
        this.uploadProgress = percentDone;
      } else if (result.body) {

        this.fileUploading = false;
        if (result.body.success) {
          /************************ GA TAG PUSH : START ********************/
          this.global.setPushToGTM({
            'event': `submit_pan_card_to_OCR`,
            'Page_Location': this.router.url.split('?')[0],
            'Page_referrer': this.global?.previousUrl,
            'CTA_text': 'Save & Continue',
            'FormID': 'form id',
            'user_id': `${this.nameOfDocument}${Math.random()}`,
            'UTM_source': '',
            'UTM_medium': '',
          });
          /************************ GA TAG PUSH : STOP ********************/
          this.global.logEventUserExperior(`Submit ${this.nameOfDocument} for OCR`);
          this.manageResultAfterUploadingFiles(result.body.result, true);
          this.dashboardService.getStepsInfo().subscribe((res) => {
            if (res.success) {
              this.sharedVarService.setStepsInfo(res.result);
              this.verifiedSteps = res.result;
            }
          });
          this.modalRef.close();
        } else {
          if (result?.body?.message) {
            this.global.errorToastr(result?.body?.message);
          } else {
            this.global.errorToastr('Your file does not valid');
          }
        }
      }
    }, error => {
      this.fileUploading = false;
    });
  }

  /***************************** CROPING STOP ********************************/



  navigate(type: string) {
    // const type: string = 'bank-account-details';
    this.global.errorToastr(this.translate.instant('verify_bank_details'))
    this.global.onActivate();
    setTimeout(() => {
      this.sharedVarService.setActivePageInfoValue(type);
    }, 500);
    this.router.navigate([type]);
  }


  timerSubscription: Subscription;
  ngOnDestroy(): void {
    this.timerSubscription && this.timerSubscription.unsubscribe();
    clearInterval(this.interval);
  }
  timeLeft: number = 90;
  interval;
  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 90;
      }
    }, 1000)
  }


  removeQueryParams() {
    this.router.navigate(['/documents-upload']);
  }

  /**
   * Set file uploader while open modal
   */
  onModalOpen() {
    this.imageChangedEvent = '';
    this.croppedImage = '';


    this.uploader = new FileUploader({
      url: `${URL}api/uploadDocument`,
      disableMultipart: false, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      maxFileSize: 5 * 1024 * 1024,
      allowedMimeType: this.allowedMimeType,
      headers: [{ name: 'Authorization', value: this.cookie.get('user_auth_token') }],
      queueLimit: this.maxUploadLimit
    });
    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
    this.response = '';
    this.uploader.response.subscribe(res => this.response = res);

    this.uploader.onBeforeUploadItem = (fileItem: any) => {
      fileItem.alias = 'file';
    }

    this.uploader.onWhenAddingFileFailed = (item, filter, options) => {
      this.onWhenAddingFileFailed(item, filter, options);
    }

    this.uploader.onAfterAddingFile = (fileItem) => {
      fileItem.withCredentials = false;
      const reader = new FileReader();
      reader.readAsDataURL(fileItem._file); // read file as data url
      reader.onload = async (event: any) => {
        this.mediaPreviews.push({ file: event.target.result, contentType: fileItem._file.type });
      }

    };
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      this.uploader.options.additionalParameter = {};
      this.uploader.options.additionalParameter['document_name'] = this.nameOfDocument;
    }
    this.uploader.onAfterAddingAll = (FileItem) => {
      setTimeout(() => {
        this.addNewAadhaarImageUpload = false;
        this.documentShowBigMedia(0);
      }, 1000);
    }
    this.uploader.onProgressItem = (fileItem: FileItem, progress: any) => {
      this.ref.detectChanges();
    }
    this.uploader.onErrorItem = (item, response, status, headers) => {
      // console.log('error item', item);
      // console.log('error status', status);
      // this.onErrorItem(item, response, status, headers);
    }
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      this.onSuccessItem(item, response, status, headers);
    }
  }

  /**
   * Get all document lists
   */
  getKYCDocumentsList(hideLoader: boolean = false) {
    this.loader = true;
    const obj = { 'section': 'get_pancard' }
    this.dashboardService.getPanDocument('', hideLoader).subscribe((res: any) => {
      // console.log('res', res);
      if (res.success) {
        this.getDocumentAvailableList = [res?.result];
        // this.sharedVarService.setStepsInfo(res.result.step_info);
        // this.verifiedSteps = res.result.step_info;
        this.loader = false;
      }
      if (hideLoader && res?.body?.success) {
        this.getDocumentAvailableList = [res.body.result];
        // this.sharedVarService.setStepsInfo(res.body.result.step_info);
        // this.verifiedSteps = res.body.result.step_info;
        this.loader = false;
      }
    });
  }
  /***************** Image/File UPLOAD: START *********************/
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    // console.log('imgageArray', response);
    let data = JSON.parse(response);
    const imgageArray = { images: [data.result.token] };
  }

  onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    let error = JSON.parse(response);
  }

  onWhenAddingFileFailed(item: any, filter: any, options: any) {
    if (filter.name === 'queueLimit') {
      if (this.maxUploadLimit) {
        this.global.errorToastr(`You can't upload more than ${this.maxUploadLimit} files`);
      } else {
        this.global.errorToastr(this.translate.instant('already_uploaded'));
      }
      return false;
    } else {
      switch (filter.name) {
        case 'mimeType':
          let mimeErrorStatement = [];
          this.allowedMimeType.map((item) => {
            const mimeDisplyError = item.split("/");
            mimeErrorStatement.push(mimeDisplyError[1]);
          });
          this.global.errorToastr(`Please upload ${mimeErrorStatement.join(", ")} only.`);
          break;
        case 'fileSize':
          this.global.errorToastr(this.translate.instant('image_size'));
          break;
        default:
          this.global.errorToastr(`Unknown error (filter is ${filter.name})`);
      }
    }
  }

  /**
   * Clear Income proof Modal to reset 
   */
  clearIncomeProofModal() {
    this.modalRef.close();
    if (this.isDocsProofRequired) {
      this.isDocsDropDownSelected = '';
    }
  }

  /***************** Image/File UPLOAD: START *********************/

  /**
   * Add new image button clicked and then process
   */
  addNewDocumentImage() {
    this.uploader.progress = 0;
    this.addNewAadhaarImageUpload = true;
    this.clickedWebcamPicture = false;
    this.viewSectionOfImage = false;
    if (!this.viewMediaPreviewsList?.length) {
      this.viewMediaPreviewsList = [];
    }
    this.viewPreviewDisplayImage = '';
    this.canvasRotateReset();
  }
  /**
   * Add new web cam button clicked and then process
   */
  addNewWebcamImage() {
    this.webCamMediaPriview = false;
    this.clickedWebcamPicture = true;
    this.liveWebcam = true;
  }

  /**
   * Display image preview
   * @param index 
   */
  documentShowBigMedia(index, progress = false) {
    if (progress) {
      this.uploader.progress = 0;
    }
    this.addNewAadhaarImageUpload = false;
    this.mediaPreviews.filter((val, i) => {
      if (i == index) {
        this.aadharDisplayImage = val;
        return val;
      }
    });
  }

  /**
   * Display Preview of File or Image
   * @param name 
   */
  previewImageBig(index) {
    this.getPreviewDisplayImage = this.viewMediaPreviewsList.filter((val, i) => {
      return i == index;
    });
    this.viewPreviewDisplayImage = this.getPreviewDisplayImage[0];

  }

  /**
   * Remove image preview
   */
  removeAadhaarMedia(name: any) {
    this.addNewAadhaarImageUpload = true;
    this.uploader.queue[0].remove();
    this.mediaPreviews = this.mediaPreviews.filter((val, i) => {
      if (val.file != name) {
        return val;
      };
    });
  }

  /**
  * Remove image from db in preview list using id and document_name
  */
  removeViewSectionMedia(fileId: any) {
    const obj = { id: fileId, document_name: this.nameOfDocument };
    this.dashboardService.removeImageFileDocument(obj).subscribe((res: any) => {
      if (res.success) {
        this.global.logEventUserExperior("Document Removed");
        this.viewMediaPreviewsList = res.result;
        if (this.viewMediaPreviewsList?.length) {
          this.viewPreviewDisplayImage = this.viewMediaPreviewsList[0];
          this.viewSectionOfImage = true;
          this.fileUploading = false;
        } else {
          this.fileUploading = false;
          this.viewSectionOfImage = false;
          this.viewMediaPreviewsList = [];
          this.addNewDocumentImage();
          if (this.nameOfDocument === 'income_proof') {
            this.clearIncomeProofModal()
          }
        }
        this.maxUploadLimit++;
        this.uploader.clearQueue();
        this.onModalOpen();
        this.getKYCDocumentsList(true);
        this.global.successToastr(res.message);
      } else {
        this.global.errorToastr(res.message);
      }
      // this.viewMediaPreviewsList = this.viewMediaPreviewsList.filter((val, i) => {
      //   if (val.id != fileId) {
      //     return val.id != fileId;
      //   };
      // });
    });
  }

  isDocsProofRequired: boolean;
  isDocsDropDown: any;
  isDocsDropDownSelected: any;
  isUploadFile: boolean;
  isUseCamera: boolean;
  documentDetails: any;
  /**
   * Open Document upload modal (Dynamically setted)
   */
  openDocumentPopupModal(nameOfDocument: any, nameOfModalTitle: any, documentStatus = '', allItem: any = '') {
    this.canvasRotateReset();
    this.isUploadFile = allItem.isUploadFile;
    this.isUseCamera = allItem.isUseCamera;
    this.allowedMimeType = allItem.mime_type;
    this.maxUploadLimit = allItem.remaining_count;

    this.isDocumentVerified = (documentStatus === 'verified') ? true : false;
    this.onModalOpen();
    this.nameOfDocument = nameOfDocument;
    this.nameOfTitleDocument = nameOfModalTitle;
    this.addNewDocumentImage();
    this.aadharDisplayImage = '';
    this.mediaPreviews = [];
    this.documentDetails = allItem;
    this.valieMimeTypeArray();


    this.isDocsProofRequired = false;
    this.isDocsDropDownSelected = '';
    if (allItem?.isDocsProofRequired) {
      this.isDocsProofRequired = allItem?.isDocsProofRequired;
      this.isDocsDropDown = allItem?.docs_proof;
    }
    this.uploader.clearQueue();
    this.global.logEventUserExperior(`Open Modal Popup for ${nameOfDocument}`);
    if (documentStatus !== "not_uploaded") {
      const objParam = { 'document_name': nameOfDocument };
      this.dashboardService.getDocumentDetails(objParam).subscribe((res: any) => {
        if (res.success) {
          if (res?.result[0]?.doc_proof_id) {
            this.isDocsDropDownSelected = res?.result[0]?.doc_proof_id;
          }
          this.fileUploading = false;
          this.manageResultAfterUploadingFiles(res.result, false);
        }
      });
    }

    this.modalRef = this.modalService.open(this.fileuploadAadharpopup, { windowClass: 'mymodal', centered: true, size: 'lg', backdrop: 'static', keyboard: false });
    this.modalRef.result.then((result) => {
      this.aadharDisplayImage = '';
      this.mediaPreviews = [];
      this.uploader.clearQueue();
      this.viewMediaPreviewsList = [];
    });
  }


  resizedataURL(datas, wantedWidth, wantedHeight) {
    // We create an image to receive the Data URI
    // var img = document.createElement('img');
    var imgElement = document.createElement('img');
    // When the event "onload" is triggered we can resize the image.
    imgElement.onload = () => {
      // We create a canvas and get its context.
      var canvas = document.createElement('canvas');
      const maxWidth = 200;
      const scaleSize = maxWidth / datas.width;

      // We set the dimensions at the wanted size.
      canvas.width = 100;
      canvas.height = datas.height * scaleSize;;
      var ctx = canvas.getContext('2d');

      // We resize the image with the canvas method drawImage();
      ctx.drawImage(datas, 0, 0, canvas.width, canvas.height);

      var srcEncoded = ctx.canvas.toDataURL(datas, 'image/jpeg');
      // console.log('datas', srcEncoded);
      const data = ctx.canvas.toDataURL();

    };
    // We put the Data URI in the image's src attribute


  }


  /**
   * Submit image/file to upload document
   */
  submitDocumentUploadModal() {
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', this.nameOfDocument);
    this.uploader.queue.map((item: any, index) => {
      uploadParam.append('file[]', item._file);
    });
    // uploadParam.append('files', queue);
    this.fileUploadingProcessStarting();
    this.dashboardService.uploadDocument(uploadParam).subscribe((result: any) => {
      if (result.type === 1 && result.loaded && result.total) {
        const percentDone = Math.round(100 * result.loaded / result.total);
        this.uploadProgress = percentDone;
      } else if (result.body) {
        this.fileUploading = false;
        if (result.body.success) {
          this.manageResultAfterUploadingFiles(result.body.result, true);
          this.modalRef.close();
        }
      }
    }, error => {
      this.fileUploading = false;
    });
  }

  /**
   * Submit Webcam upload images
   */
  submitWebCamUploadModal() {
    this.canvasRotateReset();
    let realImageBlob = [];
    this.webCamMediaList.map((item: any, index) => {
      const blobImage = this.appendFileAndSubmit(item);
      realImageBlob.push(blobImage);
    });
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', this.nameOfDocument);
    if (this.nameOfDocument === 'photograph') {
      if (this.latitude && this.longitude) {
        uploadParam.append('latitude', this.latitude);
        uploadParam.append('longitude', this.longitude);
      } else {
        this.global.errorToastr('Did not get location, please allow location permission.');
        this.mediaPreviews.pop();
        this.imageChangedEvent = '';
        this.croppedImage = '';
        this.canvasRotateReset();
        this.addNewDocumentImage();
        return;
      }
    }

    realImageBlob.map((item: any, index) => {
      // console.log('item', item);
      uploadParam.append('file[]', item, `webcamimage${index}.jpeg`);
    });
    this.fileUploadingProcessStarting();
    this.dashboardService.uploadDocument(uploadParam).subscribe((result: any) => {
      if (result.type === 1 && result.loaded && result.total) {
        const percentDone = Math.round(100 * result.loaded / result.total);
        this.uploadProgress = percentDone;
      } else if (result.body) {
        this.fileUploading = false;
        if (result.body.success) {
          /************************ GA TAG PUSH : START ********************/
          this.global.setPushToGTM({
            'event': `${this.nameOfDocument}`,
            'Page_Location': this.router.url.split('?')[0],
            'Page_referrer': this.global?.previousUrl,
            'CTA_text': 'Save & Continue',
            'FormID': 'form id',
            'user_id': `${this.nameOfDocument}${Math.random()}`,
            'UTM_source': '',
            'UTM_medium': '',
          });
          /************************ GA TAG PUSH : STOP ********************/
          this.manageResultAfterUploadingFiles(result.body.result, true);
          this.modalRef.close();
        }
      }
    }, error => {
      this.fileUploading = false;
    });
  }

  /**
   * File uploading process startind and manage modal UI(hide: webcam view, add new image view)
   */
  fileUploadingProcessStarting() {
    this.uploadProgress = 0;
    this.fileUploading = true;
    this.clickedWebcamPicture = false;
  }

  /**
   * Manage Result After Uploading FilesgetKYCDocumentsList
   * @param result 
   */
  manageResultAfterUploadingFiles(result: any, getKYCDocumentsList: boolean = false) {
    this.viewMediaPreviewsList = result;
    this.viewPreviewDisplayImage = this.viewMediaPreviewsList[0];
    this.uploader.clearQueue();
    this.webCamMediaList = [];
    this.viewSectionOfImage = true;
    this.mediaPreviews = [];
    if (getKYCDocumentsList) {
      this.getKYCDocumentsList();
    }
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

  handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      console.warn("Camera access was not allowed by you");
      this.global.warningToastr('Camera access was not allowed by you');
      this.addNewDocumentImage();
    }
  }

  public triggerSnapshot(): void {
    this.trigger.next();
    // setTimeout(() => {
    this.webCamShowMediaBig(0);
    // }, 500);
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): any {
    // const webCamPriview = [];
    if (this.webCamMediaList?.length < 2) {
      this.webCamMediaList.push(webcamImage.imageAsDataUrl);
    } else {
      this.global.errorToastr(this.translate.instant('cant_upload_max'));
      return true;
    }
  }

  /**
   * show webcam priview image
   * @param index 
   */
  webCamShowMediaBig(index) {
    this.liveWebcam = false;
    if (this.totalUploadLimit === 1) {
      this.mediaPreviews = [];
    }
    this.webCamMediaPriview = this.webCamMediaList.filter((val, i) => {
      return i == index;
    });
    // console.log('this.webCamMediaPriview', this.webCamMediaPriview);
  }

  /**
   * remove webcam image from webcal list
   */
  removeWebCamMedia(name: any) {
    this.liveWebcam = true
    this.webCamMediaList = this.webCamMediaList.filter((val, i) => {
      if (name != val) {
        return name != val;
      };
    });
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  enableWebcamPicture() {
    this.addNewAadhaarImageUpload = false;
    this.clickedWebcamPicture = true;
    this.liveWebcam = true;
    this.webCamMediaList = [];
    this.global.getLocationService().then(resp => {
      this.latitude = resp.lat;
      this.longitude = resp.lng;
    })
  }

  /************* Document upload code: END ***************/

}

