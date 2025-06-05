import { Subscription } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { AuthenticationService } from '../authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
// import { CookiesService } from "@ngx-utils/cookies";
import { environment } from 'src/environments/environment';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-autologin',
  templateUrl: './autologin.component.html',
  styleUrls: ['./autologin.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutologinComponent implements OnInit {
  env = environment;
  public registerform: FormGroup;
  idArihantPlus: string;
  code: string;
  rmcode: string;
  subrmcode: string;
  eye_img: any = 'assets/images/eye-close.svg';
  commonConfigFlow: any;
  contentData: any;
  loginInformationText: any;
  faqUrl = `${environment.faqUrl}`;
  referenceSourceQueryParam: any;
  isAvailableRMCODE: boolean;
  obs: Subscription;
  subscribeGetConfigFlowData: Subscription;
  isMobileDevice: boolean;
  loading = true;
  constructor(
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public validate: ValidationService,
    private cookieService: CookieService,
    public authenticationService: AuthenticationService,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
  ) { }

  ngOnInit(): void {
    const deleteCookieArray = ['email', 'user_token', 'user_mobile', 'user_auth_token'];
    this.global.deleteMultiCookies(deleteCookieArray);
    const prodData = this.route.snapshot.data['prod'];
    // console.log('prodData', prodData);
    // const res = prodData.prod;
    if (prodData && prodData?.result) {
      this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
        if (res) {
          this.commonConfigFlow = res;
        } else {
          this.global.setConfigFlow();
        }
      });
      const res = prodData;
      const config_info = res?.result?.config_info;
      const stepInfo = res?.result?.stepInfo;
      if (res?.result?.token) {
        this.global.deleteMultiCookies(['user_token', 'user_auth_token', 'user_mobile', 'otpMaxTime', 'email', 'mfapp']);
        if (res?.result?.token) {
          // this.cookieService.set('user_auth_token', res.result.token);
          this.global.setCookieAuthUserToken(res.result.token);
          this.sharedVarService.setValue(true);
        }
        if (res?.result?.refreshToken) {
          this.global.setRefreshToken(res?.result?.refreshToken);
        }
        this.sharedVarService.setConfigStepData(res.result.config_info);
        if (res?.result?.stepInfo) {
          this.sharedVarService.setStepsInfo(res.result.stepInfo);
        }

        if (!res.result.config_info.step_3) {
          this.loading = false;
          this.update();
          if (this.commonConfigFlow.step3 === 'email') {
            this.router.navigate(['register-email']);
          } else if (this.commonConfigFlow.step3 === 'pan_dob') {
            this.router.navigate(['register-pan-dob']);
          }
        } else if (!res.result.config_info.step_4) {
          this.loading = false;
          this.update();
          if (this.commonConfigFlow.step4 === 'email') {
            this.router.navigate(['register-email']);
          } else if (this.commonConfigFlow.step4 === 'pan_dob') {
            this.router.navigate(['register-pan-dob']);
          }
        } else if (res.result.config_info.step_3 && res.result.config_info.step_4) {
          // this.global.generateToken().subscribe(async (res: any) => {
          //   if (res.success) {
          let userD: any = {};
          if (res?.result?.appId) {
            userD['appId'] = res?.result?.appId;
          }
          if (res?.result?.panUserName) {
            userD['panUserName'] = res?.result?.panUserName;
          }
          this.cookieService.set('user', JSON.stringify(userD));
          this.sharedVarService.setLoggedUserInfoValue(userD);

          if (res?.result?.token) {
            // this.cookieService.set('user_auth_token', res.result.token);
            this.global.setCookieAuthUserToken(res.result.token);
          }
          this.loading = false;
          this.update();
          if (res?.result?.stepInfo) {
            this.sharedVarService.setStepsInfo(res?.result?.stepInfo);
            // if (!res?.result?.stepInfo?.isPanVerified && !res?.result?.stepInfo?.isKRAVerified && !res?.result?.stepInfo?.isUsedKRA) {
            //   this.global.globalLoaderMessage(this.translate.instant('kra_verifying_loader_message'));
            //   setTimeout(async () => {
            //     await this.global.verifyPanDetails();
            //   }, 500);
            // }
            if (res.result.stepInfo.isEKYCComplete === 1) {
              this.global.globalLoaderMessage();
              this.router.navigate(['thank-you']);
            } else {
              this.global.globalLoaderMessage();
              this.global.redirectToLastVerifiedPage(res?.result?.stepInfo);
            }
          } else {
            this.router.navigate(['welcome']);
          }
        }
      } else {
        this.loading = false;
        this.update();
        this.router.navigate(['/']);
      }
    } else {
      this.loading = false;
      this.update();
      // console.log('false', prodData['prod'])
    }
  }

  update() {
    this.cdr.markForCheck();
  }

}
