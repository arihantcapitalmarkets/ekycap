import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { CookiesService } from '@ngx-utils/cookies';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WebcamImage, WebcamInitError, WebcamModule, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject, Subscription, defer, from, interval } from 'rxjs';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { ImageCroppedEvent, ImageCropperModule, ImageTransform, LoadedImage } from 'ngx-image-cropper';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'primeng/api';
declare global {
  interface Window {
    AinxtSDK: any;
  }
}

@Component({
  selector: 'app-photo-capture',
  templateUrl: './photo-capture.component.html',
  styleUrls: ['./photo-capture.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, WebcamModule, ImageCropperModule]
})
export class PhotoCaptureComponent implements OnInit, AfterViewInit, OnDestroy {
  /*******************  webcam code initialize: START ***************/
  public showWebcam = true;
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    width: { ideal: 600 },
    height: { ideal: 356 }
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
  /******** webcame: START *******/
  liveWebcam = false;
  webCamMediaPriview: any;
  webCamMediaList: any = [];
  /******** webcame: END *******/
  longitude: any;
  latitude: any;
  commonConfigFlow: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(public global: GlobalService, private dashboardService: DashboardService,
    private router: Router, private route: ActivatedRoute, private translate: TranslateService,
    private serviceVarService: SharedVarService, private cookies: CookieService, private authService: AuthService) { }

  ngOnInit(): void {
    this.global.getLocationService().then(resp => {
      this.latitude = resp.lat;
      this.longitude = resp.lng;
    });
    WebcamUtil.getAvailableVideoInputs().then(
      (mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
        // console.log('this.multipleWebcamsAvailable', this.multipleWebcamsAvailable);
      }
    );
    if (environment?.isCheckGeoLocation && this.latitude && this.longitude) {
      const obj = { 'LATITUDE': this.latitude, 'LONGITUDE': this.longitude };
      this.getGeoLocation(obj);
    }
  }

  pollFunction: Observable<any>;
  availableInputs: any;
  availableInputsForSelect: any[] = [];
  cameraId: string;
  private pollSubscription: Subscription;

  ngAfterViewInit(): void {
    this.pollFunction = defer(() => from(WebcamUtil.getAvailableVideoInputs()));
    this.pollSubscription = interval(1000)
      .pipe()
      .subscribe(devices => {
        this.availableInputs = devices;
        // console.log('this.availableInputs', this.availableInputs);
        if (this.availableInputs) {
          if (this.availableInputs?.length > 0) {
            this.availableInputsForSelect = this.availableInputs.map(item => ({ value: item.deviceId, label: item.label }));
          }
          if (!this.cameraId && this.availableInputs?.length > 0) {
            this.cameraId = this.availableInputs[0].deviceId;
          }
        }
      });
    if (this.global?.AINEXTSelfieMode && this.global?.isOwnPhotoCapture !== 'Yes') {
      const script = document.createElement("script");
      script.src = "https://d1hmk1zqbz8bbp.cloudfront.net/FaceArihantProd.js";
      script.async = true;
      document.head.appendChild(script);
      setTimeout(() => {
        this.getAINEXTToken();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  /****************** AINEXT CODE START *********/
  faceImageBase64: any;
  getAINEXTToken() {
    // const tokn = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjM2IyZGMxOC0xYjYyLTQyZDQtYWFiOS1iOGM1MjhjZjg3OTUiLCJyZWZpZCI6IjEyMjM0IiwiZXhwIjoxNzE2ODc1NTc0LCJpc3MiOiJkNXdhenBlcHpmLmV4ZWN1dGUtYXBpLmFwLXNvdXRoLTEuYW1hem9uYXdzLmNvbSIsImF1ZCI6ImQ1d2F6cGVwemYuZXhlY3V0ZS1hcGkuYXAtc291dGgtMS5hbWF6b25hd3MuY29tIn0.D5NbqVFGh4BwFlDs11obS-DAsKfPV_X7lA32Ydku4Oc`;
    // window.AinxtSDK.Initialize(tokn, this.handleAINEXTSDKData);
    const obj = {};
    this.global.getAINEXTToken(obj, true).subscribe((res: any) => {
      if (res?.success) {
        if (res?.result?.Token) {
          const result = res?.result;
          var jwtToken = result?.Token;
          // console.log('jwtToken', jwtToken);
          window.AinxtSDK.Initialize(jwtToken, this.handleAINEXTSDKData);
        } else {
          this.global.errorToastr('Server error from AINXT');
        }
      } else {
        this.global.errorToastr('Server error from AINXT');
      }
    }, error => {
      if (error?.error?.message !== "Unauthorized") {
        this.global.errorToastr('Server error from AINXT');
      }
    });

  }

  handleAINEXTSDKData: (data: any) => void = (data) => {
    if (data) {
      if (data.cropped_image) {
        // console.log('Received HVError', data.cropped_image);
        this.faceImageBase64 = `data:image/jpeg;base64,${data.cropped_image}`;
        this.handleHypervergeSelfie();
      } else {
        this.cancelCropped();
        this.liveWebcam = false;
        // this.global.errorToastr("errorMessage");
      }
    } else {
      this.cancelCropped();
      this.liveWebcam = false;
    }
  }
  /****************** AINEXT CODE STOP *********/
  handleHypervergeSelfie() {
    if (this.faceImageBase64) {
      this.webCamMediaPriview = this.faceImageBase64;
      // this.webCamShowMediaBig(0);
    }
  }



  getGeoLocation(obj: any) {
    // obj['LATITUDE'] = '53.7973055';
    // obj['LONGITUDE'] = '-1.5346315';
    if (obj) {
      this.dashboardService.aiNxtLocation(obj).subscribe((res: any) => {
        if (res?.success) {
          if (res?.result?.country && res?.result?.country?.toUpperCase() !== `INDIA`) {
            // if (res?.result?.country?.toUpperCase() !== `INDIA`) {
            this.global.errorToastr('Your location is outside of INDIA so you are not validate your photo capture process');
            const userToken: any = this.cookies.get('user_auth_token');
            if (userToken) {
              this.authService.logout()
            } else {
              this.authService.logoutWithoutSession();
            }
            this.isPhotocapturing = false;
          } else if (res?.result && !res?.result?.country) {
            this.global.errorToastr('Your location is not found');
            const userToken: any = this.cookies.get('user_auth_token');
            // this.global.errorToastr('Your location is not found');
            if (userToken) {
              this.authService.logout()
            } else {
              this.authService.logoutWithoutSession();
            }
            this.isPhotocapturing = false;
          } else if (res?.result?.country && res?.result?.country?.toUpperCase() === `INDIA`) {
            this.trigger.next();
            this.isPhotocapturing = false;
          }
        } else {
          this.isPhotocapturing = false;
        }
      }, error => {
        this.isPhotocapturing = false;
        // this.global.errorToastr('Server error');
      })
    }
  }


  public cameraWasSwitched(deviceId: string): void {
    // console.log('log', deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  public handleImage(webcamImage: WebcamImage): any {
    // const webCamPriview = [];
    // console.log('webcamImage.imageAsDataUrl', webcamImage.imageAsDataUrl);
    this.webCamMediaPriview = webcamImage.imageAsDataUrl;
  }

  handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      console.warn("Camera access was not allowed by you");
      this.global.warningToastr('Camera access was not allowed by you')
    }
  }

  isPhotocapturing: boolean;
  public triggerSnapshot(): void {
    this.isPhotocapturing = true;
    const temp = this.global.getLocationService().then(resp => {
      this.latitude = resp.lat;
      this.longitude = resp.lng;
      this.canvasRotateReset();
      // this.trigger.next();
      if (environment?.isCheckGeoLocation && this.latitude && this.longitude) {
        const obj = { 'LATITUDE': this.latitude, 'LONGITUDE': this.longitude };
        this.getGeoLocation(obj);
      }
    }, error => {
      this.isPhotocapturing = true;
      this.latitude = '';
      this.longitude = '';
      this.global.errorToastr('Did not get location, please allow location permission.');
      setTimeout(() => {
        this.isPhotocapturing = false;
      }, 1000);
      return;
    });

    // this.canvasRotateReset();
    // this.trigger.next();
    // setTimeout(() => {
    // this.webCamShowMediaBig(0);
    // }, 500);
  }

  /**
   * show webcam priview image
   * @param index 
   */
  webCamShowMediaBig(index) {
    // console.log('this.webCamMediaPriview', this.webCamMediaPriview);
    this.webCamMediaPriview = this.webCamMediaList.filter((val, i) => {
      return i == index;
    });
  }

  /**
   * Submit Webcam upload images
   */
  submitWebCamUpload() {
    let realImageBlob = [];
    // this.webCamMediaList.map((item: any, index) => {
    const blobImage = this.global.appendFileAndSubmit(this.croppedImage);
    realImageBlob.push(blobImage);
    // });
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', 'photograph');
    uploadParam.append('latitude', this.latitude);
    uploadParam.append('longitude', this.longitude);
    const token = this.route.snapshot.params['token'];
    uploadParam.append('token', token);
    realImageBlob.map((item: any, index) => {
      // console.log('item', item);
      uploadParam.append('file[]', item, `webcamimage${index}.jpeg`);
    });
    this.dashboardService.uploadPhotographDocument(uploadParam).subscribe((result: any) => {
      if (result.success) {
        /************************ GA TAG PUSH : START ********************/
        this.global.setPushToGTM({
          'event': 'selfie_success',
          'Page_Location': this.router.url.split('?')[0],
          'Page_referrer': this.global?.previousUrl,
          'CTA_text': 'Confirm',
          'FormID': 'form id',
          'user_id': `selfie_success${Math.random()}`,
          'UTM_source': '',
          'UTM_medium': '',
        });
        /************************ GA TAG PUSH : STOP ********************/
        this.global.successToastr(result.message);
        const userAuth = this.cookies.get('user_auth_token');
        if (userAuth) {
          this.router.navigate(['/documents-upload']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.global.errorToastr(result.message);
        this.global.errorToastr('Please try with new link');
        const userAuth = this.cookies.get('user_auth_token');
        if (userAuth) {
          this.router.navigate(['/documents-upload']);
        } else {
          this.router.navigate(['/']);
        }
      }
    }, error => {
      this.global.errorToastr('Please try again...');
    });
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

  //  fileChangeEvent(event: any) {
  //    if (this.maxUploadLimit === this.mediaPreviews.length) {
  //      this.global.errorToastr(`You can't upload more than ${this.maxUploadLimit} files.`);
  //      return;
  //    }

  //    // if (this.nameOfDocument === 'signature') { // for signature image upload restrict upto 15kb
  //    //   const maxSizeKB = 15; //Size in KB
  //    //   const maxSize = maxSizeKB * 1024;
  //    //   if (event.target.files[0].size > maxSize) {
  //    //     this.global.errorToastr(`You can't upload more than ${maxSizeKB}KB files.`);
  //    //     return;
  //    //   }
  //    // }
  //    if (event.target.files[0].type === 'application/pdf') {
  //      // console.log('event.target.files[0].size', event.target.files[0].size);
  //      if (Number(event.target.files[0].size) <= 2000000) {
  //        const reader = new FileReader();
  //        reader.readAsDataURL(event.target.files[0]); // read file as data url
  //        reader.onload = async (events: any) => {
  //          this.mediaPreviews.push({ file: events.target.result, contentType: 'application/pdf' });
  //        }
  //        setTimeout(() => {
  //          this.addNewAadhaarImageUpload = false;
  //          this.documentShowBigMedia(this.mediaPreviews.length - 1);
  //        }, 1000);
  //      } else {
  //        this.global.errorToastr(`You can't upload more than 2 MB file size.`); return;
  //      }
  //    } else {
  //      this.imageChangedEvent = event;
  //    }
  //  }
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
    this.webCamMediaPriview.push({ file: this.croppedImage, contentType: 'image/png' });
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.canvasRotateReset();
    //  this.addNewDocumentImage();
  }


  cancelCropped() {
    // console.log('this.webCamMediaPriview', this.webCamMediaPriview);
    this.webCamMediaPriview = '';
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.canvasRotateReset();
    // this.addNewDocumentImage();
  }

  /**
   * Remove image preview
   */
  removeEditMedia(name: any) {
    //  this.addNewAadhaarImageUpload = true;
    this.webCamMediaPriview = this.webCamMediaPriview.filter((val, i) => {
      if (val.file != name) {
        return val;
      };
    });
  }

  /**
   * Submit image/file to upload document
   */
  //  submitDocumentUploadModalCropped() {
  //    if (this.isDocsProofRequired && !this.isDocsDropDownSelected) {
  //      this.global.errorToastr('Please select type of document.'); return;
  //    }
  //    let realImageBlob = [];
  //    this.mediaPreviews.map((item: any) => {
  //      const blobImage = this.appendFileAndSubmit(item.file);
  //      realImageBlob.push(blobImage);
  //    })

  //    let uploadParam: any = new FormData();
  //    uploadParam.append('document_name', this.nameOfDocument);
  //    realImageBlob.map((item: any, index) => {
  //      if (item.type === 'image/png') {
  //        uploadParam.append('file[]', item, `${this.nameOfDocument}${index}.png`);
  //      } else if (item.type === 'application/pdf') {
  //        uploadParam.append('file[]', item, `${this.nameOfDocument}${index}.pdf`);
  //      } else {
  //        uploadParam.append('file[]', item, `${this.nameOfDocument}${index}.jpeg`);
  //      }
  //    });
  //    if (this.isDocsProofRequired) {
  //      uploadParam.append('doc_proof_id', this.isDocsDropDownSelected);
  //    }
  //    this.dashboardService.uploadDocument(uploadParam).subscribe((result: any) => {
  //      if (result.type === 1 && result.loaded && result.total) {
  //        const percentDone = Math.round(100 * result.loaded / result.total);
  //        this.uploadProgress = percentDone;
  //      } else if (result.body) {
  //        this.fileUploading = false;
  //        if (result.body.success) {
  //          this.manageResultAfterUploadingFiles(result.body.result, true);
  //          this.modalRef.close();
  //        }
  //      }
  //    }, error => {
  //      this.fileUploading = false;
  //    });
  //  }

  /***************************** CROPING STOP ********************************/


}
