import { Component, OnInit, Input, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { GlobalService } from 'src/app/services/global.service';
import { DashboardService } from '../dashboard.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// declare let gtag: any;

@Component({
  selector: 'app-welcome-user',
  templateUrl: './welcome-user.component.html',
  styleUrls: ['./welcome-user.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, NgbModule]
})
export class WelcomeUserComponent implements OnInit {
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;

  public welcomeForm: UntypedFormGroup;
  isPlatformBrowser: Boolean;
  welcomeContent: any;
  welcomeContentDigilocker: any;
  welcomeKRADIGILOCKERVerified: any;
  blogUrl = `${environment.blogUrl}`;
  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    private global: GlobalService,
    public validate: ValidationService,
    private serviceVarService: SharedVarService,
    private dashboardService: DashboardService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platform: Object,
  ) {
    // this.spinner.show();
  }

  ngOnInit(): void {

    setTimeout(async () => {
      if (this.verifiedSteps && this.verifiedSteps?.isApproved) {
        this.global.checkIsApplicationApprove(this.verifiedSteps); return;
      }
    }, 200);
    if (!this.global.checkForMFAPP(this.verifiedSteps)) {
      this.navigate('address-details');
    }
    if (this.contentData?.data) {
      const data = JSON.parse(this.contentData?.data);
      this.welcomeContent = data?.welcome_content;
    }
    this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.welcomeContent = data?.welcome_content;
        this.welcomeContentDigilocker = data?.welcome_content_digilocker;
        this.welcomeKRADIGILOCKERVerified = data?.welcome_KRA_DIGILOCKER_verified;
      }
    });
    this.global.globalLoaderMessage();

    // if (this.verifiedSteps?.isPanVerified && this.verifiedSteps?.isKRAVerified) {
    this.welcomeForm = this.fb.group({
      // permit: [false, Validators.requiredTrue],
    });
    // }
    // gtag('event', 'conversion', { 'send_to': 'AW-11336858976/SRt6CJaQjPMYEOD66p0q' });
    this.global.logEventUserExperior("Landing on Welcome Screen");
  }

  navigate(type: string) {
    if (this.verifiedSteps?.isPanVerified && this.verifiedSteps?.isKRAVerified) {
      if (this.welcomeForm.valid) { // call api to store save data 
        this.router.navigate([type]);
        this.global.onActivate();
        this.serviceVarService.setActivePageInfoValue(type);
      } else {
        this.validate.validateAllFormFields(this.welcomeForm);
        this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
      }

    } else {
      this.router.navigate([type]);
      this.global.onActivate();
      this.serviceVarService.setActivePageInfoValue(type);
    }
  }

  openDigilocker() {
    if (this.welcomeForm.valid) { // call api to store save data 
      this.global.logEventUserExperior("Redirecting to digilocker for aadhar verification");
      const url = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${environment.client_id}&redirect_uri=${environment.redirect_uri}&state=ABC123r876&code_challenge=${this.verifiedSteps?.auth_code}&code_challenge_method=S256`;
      //     const url = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?
      // response_type=code&client_id=${environment.client_id}&redirect_uri=${environment.redirect_uri}&state=application_specific_data&state=ABC1234509876&disable_userpwd_login=1&aadhaar_only=Y`;
      // console.log('url', url); return;
      window.location.href = url;
    } else {
      this.validate.validateAllFormFields(this.welcomeForm);
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
    }
  }

}
