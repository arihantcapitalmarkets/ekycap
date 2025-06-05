import { environment } from 'src/environments/environment';
import { Component, OnInit, PLATFORM_ID, Inject, AfterViewInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { DashboardService } from '../dashboard.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// import { CookiesService } from '@ngx-utils/cookies';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-digilocker-redirect',
  templateUrl: './digilocker-redirect.component.html',
  styleUrls: ['./digilocker-redirect.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DigilockerRedirectComponent implements OnInit {
  isPlatformBrowser: boolean;
  // Create PDF
  cols: Array<any> = [{
    title: "Details",
    dataKey: 'details'
  }, {
    title: "Values",
    dataKey: 'values'
  }];
  rows: Array<any> = [];
  jsonData: any;
  logo = `${environment.languageParamUrl}/images/logo.png`;
  imageBase64: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private global: GlobalService,
    private sharedVarService: SharedVarService,
    private dashboardService: DashboardService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private authenticationService: AuthenticationService
  ) { }

  screenHeight: number | string;

  @HostListener("window:resize", [])
  private onResize() {
    this.onResizeScreen();
  }

  onResizeScreen() {
    this.screenHeight = window.innerHeight / 1.5;
  }

  async ngOnInit() {
    this.onResizeScreen();
    const Logo = this.getBase64ImageLogo(`${environment.languageParamUrl}images/logo.png`);

    // console.log('this.logo', Logo);
    this.logo = Logo;
    this.spinner.show();
    // console.log('code', this.route.snapshot.queryParamMap.get('code')); return;
    // const obj = { 'panNumber': 'deaaa' };
    setTimeout(async () => {
      if (this.route.snapshot.queryParamMap.get('code')) {
        this.checkDigilockerCode();
      } else {
        this.route.queryParams.subscribe(params => {
          if (params['error'] === "user_cancelled") { // error = user_cancelled
            this.sharedVarService.getStepsInfo().subscribe((result) => {
              if (result?.is_boat_user && result?.isBeta) {
                window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message="Cancelled by user"`;
                return;
              }
            });
          }
        });
        this.router.navigate(['/welcome']);
      }
      // const jsonData = {
      //   aadharCardNumber: "xxxxxxxx2108",
      //   aadharNumber: "xxxxxxxx2108",
      //   address: "RAMKRUSHNNAGAR STATION ROAD ,LIMBDI SURENDRA NAGAR, SURENDRA NAGAR, 363 421, Gujarat, INDIA",
      //   city: "Sajjanpur",
      //   dateOfBirth: "01/02/1996",
      //   fullName: "PATEL RAVIKUMAR MAHESHBHAI",
      //   gender: "MALE",
      //   generatedOn: "13/4/2022",
      //   isAadharVerified: true,
      //   isPanVerified: true,
      //   landmark: "",
      //   locality: "",
      //   panNumber: "EXMPP0974D",
      //   photoURl: "https://ekyc-development-documents.s3.ap-south-1.amazonaws.com/GP000473/photograph/GP000473_photogrpah.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUAG4THDG6CJEPIVW%2F20220414%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20220414T114924Z&X-Amz-Expires=72000&X-Amz-Signature=bd46020699dc0e69e4c35527ae069b218cb9f0c1581149e76f7ae302e83a9db6&X-Amz-SignedHeaders=host",
      //   pincode: "363310",
      //   refId: "GP000458",
      //   state: "Gujarat"
      // };
      // this.jsonData = jsonData;
      // const imageBase64 = await this.getBase64Image(jsonData?.photoURl);
      // this.imageBase64 = imageBase64;
      // setTimeout(() => {
      //   this.createDigilockerDataPdf(this.imageBase64, this.logo);
      // }, 1500);
    }, 1000);
  }

  checkDigilockerCode() {
    this.dashboardService.sendCodeOfDGlocker(this.route.snapshot.queryParamMap.get('code')).subscribe(async (res: any) => {
      if (res.success) {
        if (res?.result?.is_boat_user && res?.result?.isBeta) {
          window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=1&message="Digilocker verified successfully"`;
          return;
        }
        this.sharedVarService.setStepsInfo(res.result);
        const objAadharPan: any = { 'aadharNumber': res.result.aadharNumber, 'panNumber': res.result.panNumber };
        this.sharedVarService.setAadharPanInfoValue(objAadharPan);
        this.global.successToastr(res.message);
        if (res.result.aadharNumber && res.result.panNumber) {
          const jsonData = res.result;
          this.jsonData = jsonData;
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
            'event': 'digilocker_succesful',
            'Page_Location': this.router.url.split('?')[0],
            'Page_referrer': this.global?.previousUrl,
            'CTA_text': 'Check Digilocker Code',
            'FormID': 'form id',
            'user_id': `digilocker_succesful${Math.random()}`,
            'UTM_source': utmSource ? utmSource : '',
            'UTM_medium': utmMedium ? utmMedium : '',
          });
          /************************ GA TAG PUSH : STOP ********************/
          if (res?.result?.photoURl) {
            // const imageBase64 = await this.getBase64Image(res?.result?.photoURl);
            // this.imageBase64 = imageBase64;
            // setTimeout(() => {
            // this.createDigilockerDataPdf(this.imageBase64, this.logo);
            this.router.navigate(['/personal-details']);
            // }, 1000);
          } else {
            this.router.navigate(['/personal-details']);
          }
        } else {
          this.router.navigate(['/welcome']);
        }
      } else {
        if (res?.result?.is_boat_user && res?.result?.isBeta) {
          if (res?.message) {
            window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message=${res?.message}`;
          } else {
            window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message="Your pan is not match"`;
          }
          return;
        }
        this.global.errorToastr(res.message);
        this.router.navigate(['/welcome']);
      }
    }, error => {
      // console.log('error', error?.status);
      // console.log('errrror', error?.error?.message);
      this.spinner.show();
      this.dashboardService.getStepsInfo().subscribe((resStep) => {
        if (resStep?.success && resStep?.result?.is_boat_user && resStep?.result?.isBeta) {
          this.spinner.hide();
          if (error?.error?.message) {
            window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message=${error?.error?.message}`;
          } else {
            window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message="Digilocker data not found"`;
          }
        } else {
          this.spinner.hide();
          this.router.navigate(['/welcome']);
        }
      });
      // this.sharedVarService.getStepsInfo().subscribe((resVal) => {
      //   console.log('error', resVal);
      //   if (resVal) {
      //     if (resVal?.is_boat_user && resVal?.isBeta) {
      //       if (error?.error?.message) {
      //         window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message=${error?.error?.message}`;
      //       } else {
      //         window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message="Digilocker data not found"`;
      //       }
      //     } else {
      //       this.router.navigate(['/welcome']);
      //     }
      //   } else {
      // this.dashboardService.getStepsInfo().subscribe((resStep) => {
      //   if (resStep?.success && resStep?.result?.is_boat_user && resStep?.result?.isBeta) {
      //     if (error?.error?.message) {
      //       window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message=${error?.error?.message}`;
      //     } else {
      //       window.location.href = `${environment?.mobileDigiLockerReturnUrl}?success=0&message="Digilocker data not found"`;
      //     }
      //   } else {
      //     this.router.navigate(['/welcome']);
      //   }
      // });
      //   }
      // });
      // if (error) {
      //   this.router.navigate(['/welcome']);
      // }
    });
  }

  /**
   * Regenerate Access Token 
   */
  regenerateToken() {
    const token = this.cookie.get('user_auth_token');
    let obj = {}
    if (localStorage.getItem('ref_token') && environment.isRefreshTokenCheck) {
      obj['refreshToken'] = JSON.parse(localStorage.getItem('ref_token'));
      // // Set interval to call API every 15 minutes (900000 milliseconds)
      this.authenticationService.regenerateAccessToken(obj, true)
        .subscribe(
          data => {
            // Handle API data here
            // console.log(data);
            if (data?.result?.token) {
              // this.cookie.set('user_auth_token', data?.result?.token);
              this.global.setCookieAuthUserToken(data.result.token);
              if (environment.isRefreshTokenCheck) {
                this.authenticationService.setAccessTokenExpiry();
              }
              this.checkDigilockerCode();
            } else {
              this.global.clearLocalStorage();
              this.global.errorToastr('Authentication Time OUT, Please login again to continue...');
              this.router.navigate(['/']);
            }
          },
          error => {
            // Handle error here
            console.error(error);
          }
        );
    }
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

  createDigilockerDataPdf(imageBase64: any, logo: any) {
    let docs: any = new jsPDF();
    docs.setFontSize(14);
    docs.text('DigiLocker verified e-Aadhaar', 75, 38);
    docs.setFontSize(10);
    docs.text('This Document is generated form Verified Aadhaar XML obtained from DigiLocker with due user consent and authentication', 105, 45,
      {
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        align: 'center',
        maxWidth: '90%'
      });
    docs.addImage(logo, 'JPEG', 10, 15);
    docs.setFontSize(12);
    docs.text('This PDF is generated from XML datamate provided by DIGILOCKER', 15, 180,
      {
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        align: 'left',
        maxWidth: '90%'
      });

    docs.setFontSize(12);
    docs.setTextColor(27, 102, 180);
    // docs.text('www.arihantcapital.com', 25, 175,
    //   {
    //     orientation: 'p',
    //     unit: 'mm',
    //     format: 'a4',
    //     putOnlyUsedFonts: true,
    //     align: 'left',
    //     maxWidth: '90%'
    //   });
    docs.textWithLink('www.arihantcapital.com', 43, 189, { url: 'www.arihantcapital.com' });
    docs.setTextColor(0, 0, 0);
    docs.text('| For Limited Circulation | CONFIDENTIAL', 89, 189,
      {
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        align: 'left',
        maxWidth: '90%'
      });



    docs.autoTable({
      html: '#mytable',
      startY: 60,
      // tableLineColor: [109, 122, 222],
      // tableLineWidth: 0.75,
      // tableLineHeight: 1.75,
      styles: {
        // font: 'Meta',
        // lineColor: [144, 62, 80],
        // height: 15,
        lineWidth: 0.55,
        lineHeight: 10.55,
      },
      headerStyles: {
        fillColor: [0, 0, 0],
        fontSize: 11
      },
      bodyStyles: {
        fillColor: [250, 250, 250],
        textColor: 50,
        fontStyle: 'normal',
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
        fontStyle: 'normal',
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 80, cellHeight: 35 },
      },
      didParseCell(data) {
        if (data.column.index === 0) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.height = '100px';
        }
        if (data.column.index === 0 || data.column.index === 2) {
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 2 && data.column.index === 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
        if (data.row.index === 3 && data.column.index === 2) {
          data.cell.styles.border = 'none';
        }
      },
      // startY: 100,
      didDrawCell: function (data) {
        data.cell.styles.height = '150px';
        // data.cell.contentHeight = 150;
        // console.log('data.row.cells[0].styles.fontStyle', data.row.cells[0].styles.fontStyle);

        // console.log('data', data.row);
        if (data.row.index === 1 && data.column.index === 1 && data.cell.section === 'body') {
          data.cell.styles.fontStyle = 'normal';
        }

        if (data.row.index === 3 && data.cell.section === 'body') {
          // data.row.height = 50;
          data.cell.styles.halign = 'center';
        }
        if (data.row.index === 3 && data.column.index === 2 && data.cell.section === 'body') {
          data.cell.styles.border = 'none';
          data.cell.styles.halign = 'center';
          data.cell.height = 170;
          // var img = td.getElementsByTagName('img')[0];
          var dim = 50;
          // var textPos = data.cell.textPos;
          docs.addImage(imageBase64, data.cell.x + 8, data.cell.y + 5, dim, dim);
        }
        // if (data.row.index === 1 && data.column.index === 1 && data.cell.section === 'body') {
        //   // var img = td.getElementsByTagName('img')[0];
        //   var dim = 50;
        //   // var textPos = data.cell.textPos;
        //   docs.addImage(imageBase64, data.cell.x, data.cell.y, dim, dim);
        // }
      }

    });
    // docs.save("table.pdf"); return;
    var blob = docs.output('blob');
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', 'aadhar_document');
    uploadParam.append('file[]', blob, 'permanent.pdf');
    uploadParam.append('isDigilockerVerified', true);
    // uploadParam.append('files', queue);
    this.dashboardService.uploadDocument(uploadParam).subscribe((res: any) => {
      // console.log('res', res);
    });
    // Download PDF document  
    // docs.save('table.pdf');
  }

  getBase64ImageLogo(url) {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      // console.log('logo base 64', dataURL);
      this.logo = dataURL;
      return dataURL;
    }
    return img.src = url
  }

  getBase64Image(url) {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      // console.log('dataURL - image', dataURL);
      this.imageBase64 = dataURL;
      return dataURL;
    }
    return img.src = url
  }

  /*************** Create PDF/BLOB: STOP *****************/
}
