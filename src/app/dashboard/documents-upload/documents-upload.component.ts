import { SharedVarService } from './../../services/sharedVar.service';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploader, FileItem, ParsedResponseHeaders, FileUploadModule } from 'ng2-file-upload';
import { NgbModal, NgbActiveModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { WebcamImage, WebcamInitError, WebcamUtil, WebcamModule } from 'ngx-webcam';
import { Subject, Observable, interval, Subscription } from 'rxjs';
import { DashboardService } from '../dashboard.service';

import { ImageCroppedEvent, ImageCropperModule, ImageTransform, LoadedImage } from 'ngx-image-cropper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { take } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { InPersonVideoComponent } from "../document-modal/in-person-video/in-person-video.component";
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";

const URL = environment.baseUrlOfUser;

@Component({
  selector: 'app-documents-upload',
  templateUrl: './documents-upload.component.html',
  styleUrls: ['./documents-upload.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, ImageCropperModule, FileUploadModule, WebcamModule, InPersonVideoComponent, ControlMessagesComponent]
})
export class DocumentsUploadComponent implements OnInit {
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() commonConfigFlow: any;
  @ViewChild('emailNotVerify') emailNotVerify: any;
  getDocumentAvailableList: any[] = [];
  fileUploading: boolean;
  @Output() done = new EventEmitter<any>();
  ipvDocumentStatus: string;
  @ViewChild('fileuploadAadharpopup') fileuploadAadharpopup: any;
  @ViewChild('fileuploadSignaturepopup') fileuploadSignaturepopup: any;
  @ViewChild('fileuploadIncomeProof') fileuploadIncomeProof: any;
  @ViewChild('ipvPopup') IPVPopup: any;
  @ViewChild('camsPdfGenerating') camsPdfGenerating: any;
  public emailform: UntypedFormGroup;
  public otpForm: UntypedFormGroup;

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



  /********************** Signature PAD: START **********************/
  signaturePadLoading: boolean;
  signatureWidth: any;
  points = [];
  signatureImage;
  isEnableSignaturePad: boolean;
  /********************** Signature PAD: END **********************/

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
  isCamsPDfReceived: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public global: GlobalService,
    private ref: ChangeDetectorRef,
    private ngbActiveModal: NgbActiveModal,
    private modalService: NgbModal,
    private serviceVarService: SharedVarService,
    private cookie: CookieService,
    private dashboardService: DashboardService,
    private elementRef: ElementRef,
    private translate: TranslateService,
    public fb: UntypedFormBuilder
  ) { }



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
    if (this.isDocsProofRequired) {
      uploadParam.append('doc_proof_id', this.isDocsDropDownSelected);
    }
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
        // this.addNewWebcamImage();
        return;
      }
    }
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
          this.global.logEventUserExperior(`Verified ${this.nameOfDocument}`);
          this.manageResultAfterUploadingFiles(result.body.result, true);
          this.modalRef.close();
        } else {
          if (result?.body?.message) {
            if (this.nameOfDocument === 'pan_document') {
              this.removeEditMedia(this.aadharDisplayImage?.file);
            }
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

  ngOnInit(): void {
    if (this.verifiedSteps.mf_app) {
      setTimeout(async () => {
        if (this.verifiedSteps && this.verifiedSteps.isApproved) {
          this.global.checkIsApplicationApprove(this.verifiedSteps); return;
        }
      }, 500);
      if (this.verifiedSteps.hasOwnProperty('isNominatedVerified') && !this.verifiedSteps?.isNominatedVerified) {
        setTimeout(() => {
          this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
        }, 500);
      } else {
        if (this.verifiedSteps.hasOwnProperty('isSignaturePhotographUploaded') && !this.verifiedSteps?.isSignaturePhotographUploaded) {
          this.ref.detectChanges();
          setTimeout(() => {
            this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
          }, 500);
          // this.navigate('bank-account-details');
          // this.getKYCDocumentsList(); // get document lists
        } else {
          this.getKYCDocumentsList(); // get document lists
        }
        WebcamUtil.getAvailableVideoInputs()
          .then((mediaDevices: MediaDeviceInfo[]) => {
            this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
          });
      }

    } else {
      this.global.redirectToLastVerifiedToastrGold(this.verifiedSteps);
    }
  }

  navigate(type: string) {
    // const type: string = 'bank-account-details';
    this.global.errorToastr(this.translate.instant('verify_bank_details'))
    this.global.onActivate();
    setTimeout(() => {
      this.serviceVarService.setActivePageInfoValue(type);
    }, 500);
    this.router.navigate([type]);
  }

  timerSubscription: Subscription;
  ngAfterViewInit() {
    this.global.logEventUserExperior("Document Upload");
    // set the initial state of the video
    this.route.queryParams.subscribe(params => {
      if (params['ecres']) {
        this.isCamsPDfReceived = false;
        setTimeout(() => {
          this.startTimer();
          this.modalRef = this.modalService.open(this.camsPdfGenerating, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
          const numbers = interval(1000 * 5 * 1);
          const takeNumbers = numbers.pipe(take(3));
          this.timerSubscription = takeNumbers.subscribe(x => {
            this.checkIncomeProofGenerated(x);
          }, error => {
            this.timerSubscription.unsubscribe();
            this.isCamsPDfReceived = false;
          });
        }, 1000);

      }
    })
  }

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

  checkIncomeProofGenerated(takeNumber: number) {
    const objParam = { 'document_name': 'income_proof' };
    this.dashboardService.getDocumentDetailsWithLoaderOption(objParam, true).subscribe((res: any) => {
      if (res.success) {
        // console.log('res?.result?.length', res?.result?.length);
        if (res?.result?.length) {
          this.isCamsPDfReceived = true;
          this.getKYCDocumentsList(true);
          this.removeQueryParams(true);
          this.modalRef.close();
          this.ngOnDestroy();
        } else if (takeNumber === 2) {
          this.isCamsPDfReceived = false;
          this.removeQueryParams(true);
          this.modalRef.close();
          this.ngOnDestroy();
        }
      } else {
        if (takeNumber === 2) {
          this.isCamsPDfReceived = false;
          this.removeQueryParams(false);
          this.modalRef.close();
          this.ngOnDestroy();
        }
      }
    }, error => {
      this.isCamsPDfReceived = false;
      this.removeQueryParams(false);
      this.modalRef.close();
      this.ngOnDestroy();
      this.global.errorToastr('We are found server error, Please try again.')
    });
  }

  removeQueryParams(isPDFGenerate: boolean = false) {
    // console.log('this.verifiedSteps', this.verifiedSteps);
    // console.log('isPDFGenerate', isPDFGenerate);
    if (this.verifiedSteps?.is_boat_user && this.verifiedSteps?.isBeta) {
      if (isPDFGenerate) {
        window.location.href = `${environment?.mobileCamsKRAReturnUrl}?success=1&message="Bank Statement Fetched successfully"`;
      } else {
        window.location.href = `${environment?.mobileCamsKRAReturnUrl}?success=0&message="Data is not found"`;
      }
      return;
    }
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
    const obj = { 'section': 'other' }
    this.dashboardService.getSectionDocumentAvailable(obj, hideLoader).subscribe((res: any) => {
      if (res.success) {
        this.getDocumentAvailableList = res.result.documents;
        this.serviceVarService.setStepsInfo(res.result.step_info);
        this.verifiedSteps = res.result.step_info;
        this.loader = false;
      }
      if (hideLoader && res?.body?.success) {
        this.getDocumentAvailableList = res.body.result.documents;
        this.serviceVarService.setStepsInfo(res.body.result.step_info);
        this.verifiedSteps = res.body.result.step_info;
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
    if (this.nameOfDocument === 'income_proof') {
      this.modalRef = this.modalService.open(this.fileuploadIncomeProof, { windowClass: 'mymodal', centered: true, size: 'lg', backdrop: 'static', keyboard: false });
      this.modalRef.result.then((result) => {
        if (result === 'ok') {
          this.modalRef = this.modalService.open(this.fileuploadAadharpopup, { windowClass: 'mymodal', centered: true, size: 'lg', backdrop: 'static', keyboard: false });
          this.modalRef.result.then((result) => {
            this.aadharDisplayImage = '';
            this.mediaPreviews = [];
            this.uploader.clearQueue();
            this.viewMediaPreviewsList = [];
          });
        } else {
          return false;
        }
      });
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

    if (nameOfDocument === 'income_proof' && documentStatus === "not_uploaded") {
      this.modalRef = this.modalService.open(this.fileuploadIncomeProof, { windowClass: 'mymodal', centered: true, size: 'lg', backdrop: 'static', keyboard: false });
      this.modalRef.result.then((result) => {
        if (result === 'ok') {
          this.modalRef = this.modalService.open(this.fileuploadAadharpopup, { windowClass: 'mymodal', centered: true, size: 'lg', backdrop: 'static', keyboard: false });
          this.modalRef.result.then((result) => {
            this.aadharDisplayImage = '';
            this.mediaPreviews = [];
            this.uploader.clearQueue();
            this.viewMediaPreviewsList = [];
          });
        } else {
          return false;
        }
      });
    } else {
      this.modalRef = this.modalService.open(this.fileuploadAadharpopup, { windowClass: 'mymodal', centered: true, size: 'lg', backdrop: 'static', keyboard: false });
      this.modalRef.result.then((result) => {
        this.aadharDisplayImage = '';
        this.mediaPreviews = [];
        this.uploader.clearQueue();
        this.viewMediaPreviewsList = [];
      });
    }
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
  /***
    * Enable Signature pad
    */
  enableSignaturePad() {
    // const navbarToggler =
    //   this.elementRef.nativeElement.querySelector('canvas');
    // console.log('navbarToggler', navbarToggler);
    this.isEnableSignaturePad = true;
    this.viewSectionOfImage = false;
    this.fileUploading = false;
  }
  clearImage() {
    console.log('clear image');
  }

  showImage(baseImage: any) {
    // console.log('data', baseImage);
    this.signatureImage = baseImage;
    this.isEnableSignaturePad = true;
    // this.webCamMediaList.push({ file: this.signatureImage, contentType: 'image/png' });
  }

  removeSignatureImage() {
    // console.log('removeSignatureImage');
    this.signatureImage = '';
    this.isEnableSignaturePad = false;
  }

  submitSignaturePadImageModal() {
    let realImageBlob = [];
    const blobImage = this.appendFileAndSubmit(this.signatureImage);
    realImageBlob.push(blobImage);

    // const queue = [];
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', this.nameOfDocument);
    realImageBlob.map((item: any, index) => {
      uploadParam.append('file[]', item, `signatureimage${index}.jpeg`);
    });
    this.fileUploading = true;
    this.isEnableSignaturePad = false;
    this.global.logEventUserExperior(`Submit Signature`);
    this.dashboardService.uploadDocument(uploadParam).subscribe((result: any) => {
      if (result.type === 1 && result.loaded && result.total) {
        const percentDone = Math.round(100 * result.loaded / result.total);
        this.uploadProgress = percentDone;
      } else if (result.body) {
        this.fileUploading = false;
        if (result.body.success) {
          this.global.logEventUserExperior(`Submitted Signature Successfully`);
          this.viewMediaPreviewsList = result.body.result;
          this.viewPreviewDisplayImage = this.viewMediaPreviewsList[0];
          this.uploader.clearQueue();
          this.signatureImage = '';
          this.viewSectionOfImage = true;
          this.getKYCDocumentsList(true);
          this.modalRef.close();
        }
      }
    }, error => {
      this.fileUploading = false;
    });
  }
  /**
   * Open Signature upload modal
   */
  openSinaturePopupModal(nameOfDocument: any, nameOfModalTitle: any, documentStatus = '', allItem: any = '') {
    this.allowedMimeType = allItem.mime_type;
    this.maxUploadLimit = allItem.remaining_count;
    this.totalUploadLimit = allItem.total_upload;
    this.isDocumentVerified = (documentStatus === 'verified') ? true : false;
    this.onModalOpen();
    this.webCamMediaList = [];
    this.signatureWidth = 300;
    this.signatureImage = '';

    this.nameOfDocument = nameOfDocument;
    this.nameOfTitleDocument = nameOfModalTitle;
    this.documentDetails = allItem;

    this.addNewDocumentImage();
    this.aadharDisplayImage = '';
    this.mediaPreviews = [];
    this.uploader.clearQueue();
    if (documentStatus !== "not_uploaded") {
      const objParam = { 'document_name': nameOfDocument };
      this.dashboardService.getDocumentDetails(objParam).subscribe((res: any) => {
        if (res.success) {
          this.fileUploading = false;
          this.manageResultAfterUploadingFiles(res.result, false);
        }
      });
    }
    this.modalRef = this.modalService.open(this.fileuploadSignaturepopup, { windowClass: 'mymodal', centered: true, size: 'lg', backdrop: 'static', keyboard: false });
    this.modalRef.result.then((result) => {
      this.aadharDisplayImage = '';
      this.mediaPreviews = [];
      this.uploader.clearQueue();
      this.isEnableSignaturePad = false;
    });
  }

  /************* SIGNATURE DOCUMENT: START ***************/

  submitDocumentUpload() {

    if (!this.commonConfigFlow?.isEsignRequired) {
      this.finishTheEKYC();
    } else {
      if (!this.verifiedSteps?.isBankAccountVerified) {
        const type: string = 'bank-account-details';
        this.global.errorToastr(this.translate.instant('verify_bank_details'))
        this.router.navigate([type]);
        this.global.onActivate();
        this.serviceVarService.setActivePageInfoValue(type);
      } else {
        this.dashboardService.submitDocumentUpload().subscribe((res: any) => {
          if (res.success) {
            this.verifiedSteps['isDocumentUploaded'] = true;
            this.serviceVarService.setStepsInfo(this.verifiedSteps);
            // if (res?.result?.esignUrl) {
            //   this.serviceVarService.setEsignPdfData(res?.result?.esignUrl);
            // }
            this.serviceVarService.setActivePageInfoValue('esign-confirm');
            this.router.navigate(['esign-confirm']);
            this.global.onActivate();
          } else {
            if (!res?.result?.isDocumentUploaded) {
              this.global.errorToastr(this.translate.instant('Upload_All_Documents'));
            } else if (!res?.result?.isEmailVerified) {
              this.emailData = res.result;
              this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
              this.setValidateOTPForm();
              this.resendVerifyEmailWithOTP();
              // this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
            } else if (res?.message) {
              this.global.errorToastr(res?.message);
            }

            // if (res.message === 'Please fill all details and verify your email for esign') {
            //   this.global.errorToastr(res.message);
            // } else {
            //   this.global.errorToastr(this.translate.instant('upload_all_documents));
            // }
          }
        });
      }
    }
  }

  emailData: any;
  /**
   * Finish kyc 
   */
  finishTheEKYC() {
    this.dashboardService.finishEKYC().subscribe((res: any) => {
      if (res.success) {

        if (res?.result?.is_all_step_completed && res?.result?.is_email_verified) {
          this.verifiedSteps.isEKYCComplete = 1;
          this.global.successToastr(res.message);
          this.router.navigate(['thank-you']);
        } else if (res.result.is_all_step_completed && !res.result.is_email_verified) {
          this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
          this.setValidateOTPForm();
          setTimeout(() => {
            this.resendVerifyEmailWithOTP();
          }, 1000);
          // this.modalRef = this.modalService.open(this.emailNotVerify, { centered: true, backdrop: 'static', keyboard: false });
        } else if (!res.result.is_document_uploaded) {
          this.global.errorToastr(this.translate.instant('Upload_All_Documents'));
        }
      } else {
        this.global.errorToastr(this.translate.instant('Upload_All_Documents'));
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
   * verify email before submit ekyc
   */
  resendVerifyEmailWithOTP() {
    this.dashboardService.resendVerificationEmail().subscribe((res: any) => {
      if (res.success) {

        this.global.successToastr(res.message);
        // this.modalRef.close();
      } else {
        this.global.errorToastr(res.message);
        // this.modalRef.close();
      }
    }, error => {
      // this.modalRef.close();
    })
  }


  /**
   * submit aadhar upload and then close
   */
  cancelModal($event) {
    // console.log('$event', $event);
    if ($event === 'address-proof') {
      // this.aadharDisplayImage = '';
      // this.mediaPreviews = [];
      // this.uploader.clearQueue();
      console.log('this address close', $event);
    } else if ($event === 'bank-statement') {
      console.log('this bank-statement close', $event);
    } else if ($event === 'photograph') {
      console.log('this photograph close', $event);
    } else if ($event === 'cancelled-cheque') {
      console.log('this cancelled-cheque close', $event);
    } else if ($event === 'ipv') {
      console.log('this IPV close', $event);
      this.getKYCDocumentsList(true);
    }
    this.modalRef.close();
  }

  /************************** IN-PERSON-VIDEO:START **********************/
  /**
  * Open IPV upload modal (Dynamically setted)
  */
  openIPVPopupModal(nameOfDocument: any, nameOfModalTitle: any, documentStatus = '', allItem: any = '') {
    this.isDocumentVerified = (documentStatus === 'verified') ? true : false;
    this.nameOfDocument = nameOfDocument;
    this.nameOfTitleDocument = nameOfModalTitle;
    this.mediaPreviews = [];
    this.ipvDocumentStatus = documentStatus;
    this.documentDetails = allItem;
    // if (documentStatus !== "not_uploaded") {
    //   const objParam = { 'document_name': nameOfDocument };
    //   this.dashboardService.getDocumentDetails(objParam).subscribe((res: any) => {
    //     if (res.success) {
    //       this.fileUploading = false;
    //       // this.manageResultAfterUploadingFiles(res.result, false);
    //     }
    //   });
    // }
    this.modalRef = this.modalService.open(this.IPVPopup, { centered: true, size: 'lg', backdrop: 'static', keyboard: false });
    this.modalRef.result.then((result) => {
      // console.log('result', this.IPVPopup);
      this.aadharDisplayImage = '';
      this.mediaPreviews = [];
    });
  }

  /************************************* EMAIL CHANGE *************************************/
  isNeedEmailChange: boolean;
  emailChange() {
    this.isNeedEmailChange = true;
    this.setValidateTheForm();
  }

  /**
   * Set validation the form
   */
  setValidateTheForm() {
    this.emailform = this.fb.group({
      email: ['', Validators.compose([Validators.required, ValidationService.emailValidator])],
    });
  }

  cancelEmailChange() {
    this.isNeedEmailChange = false;
  }

  /**
   * verify email before submit ekyc
   */
  updateSendVerifyEmail() {
    const obj = {
      email: this.emailform.value.email
    }
    this.dashboardService.updateEmailSendEmail(obj).subscribe((res: any) => {
      if (res.success) {
        this.cancelEmailChange();
        this.global.successToastr(res.message);
        this.modalRef.close();
      } else {
        this.global.errorToastr(res.message);
        // this.modalRef.close();
      }
    }, error => {
      this.cancelEmailChange();
      this.modalRef.close();
    })
  }


  /**
   * verify email before submit ekyc
   */
  updateSendVerifyEmailWithOTP() {
    const obj = {
      email: this.emailform.value.email
    }
    this.dashboardService.updateEmailSendEmail(obj).subscribe((res: any) => {
      if (res.success) {

        this.cancelEmailChange();
        this.global.successToastr(res.message);
        this.setValidateOTPForm();
        this.checkSubmitDoccuments();
        // this.modalRef.close();
      } else {
        this.global.errorToastr(res.message);
        // this.modalRef.close();
      }
    }, error => {
      this.cancelEmailChange();
      // this.modalRef.close();
    })
  }

  /**
   * Set validation the form
   */
  setValidateOTPForm() {
    this.otpForm = this.fb.group({
      otp: ['', Validators.compose([Validators.required, Validators.maxLength(6)])],
    });
  }

  /**
   * verify email before submit ekyc
   */
  OTPVerifyOfEmail() {
    const obj = {
      otp: Number(this.otpForm.value.otp)
    }
    this.dashboardService.otpVerificationOfEmail(obj).subscribe((res: any) => {
      if (res.success) {
        /************************ GA TAG PUSH : START ********************/
        this.global.setPushToGTM({
          'event': 'email_verification_success',
          'Page_Location': this.router.url.split('?')[0],
          'Page_referrer': this.global?.previousUrl,
          'CTA_text': 'Submit',
          'FormID': 'form id',
          'user_id': `email_verification_success${Math.random()}`,
          'UTM_source': '',
          'UTM_medium': '',
        });
        /************************ GA TAG PUSH : STOP ********************/
        this.verifiedSteps['isEmailVerified'] = true;
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
   * Share photo capture link
   */
  sharePhotoCaptureLink() {
    this.dashboardService.sharePhotoCaptureLink().subscribe((res: any) => {
      if (res.success) {
        this.global.successToastr(res.message);
      } else {
        this.global.errorToastr(res.message);
      }
    }, error => {
    })
  }


  checkSubmitDoccuments() {
    this.dashboardService.submitDocumentUpload(true).subscribe((res: any) => {
      if (res.success) {
        this.verifiedSteps['isDocumentUploaded'] = true;
        this.serviceVarService.setStepsInfo(this.verifiedSteps);
      } else {
        this.emailData = res.result;
        // this.modalRef.close();
      }
    });
  }

  /**
 * Fetch Bank Statement using CAMS service
 */
  fetchBankStatement() {
    this.dashboardService.fetchCamsdetails().subscribe((res: any) => {
      if (res.success) {
        if (res?.result?.url) {
          window.location.href = res?.result?.url;
        } else {
          if (res?.message) {
            this.global.errorToastr(res?.message);
          } else {
            this.global.errorToastr('Data not found, please try again later');
          }
        }
      } else {
        if (res?.message) {
          this.global.errorToastr(res?.message);
        } else {
          this.global.errorToastr('Data not found, please try again later');
        }
      }
    }, error => {
      this.global.errorToastr('Data not found from server');
    });
  }

}

