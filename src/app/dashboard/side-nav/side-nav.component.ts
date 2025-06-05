import { Subscription } from 'rxjs';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { GlobalService } from 'src/app/services/global.service';
import { DashboardService } from '../dashboard.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { CookiesService } from "@ngx-utils/cookies";
import { AuthGuard } from 'src/app/guard/auth.guard';
import 'rxjs/add/operator/pairwise';
import { filter } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NomineeDetailsComponent } from "../nominee-details/nominee-details.component";
import { BankAccountDetailsComponent } from "../bank-account-details/bank-account-details.component";
import { SegmentBrokerageComponent } from "../segment-brokerage/segment-brokerage.component";
import { AddressDetailsComponent } from "../address-details/address-details.component";
import { PersonalDetailsComponent } from "../personal-details/personal-details.component";
import { DeclarationsComponent } from '../declarations/declarations.component';
import { SignaturePhotographComponent } from '../signature-photograph/signature-photograph.component';
import { DocumentsUploadComponent } from '../documents-upload/documents-upload.component';
import { EsignComponent } from 'src/app/esign-flow/esign/esign.component';
import { EsignConfirmComponent } from '../esign-confirm/esign-confirm.component';
import { WelcomeUserComponent } from '../welcome-user/welcome-user.component';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, NgbModule, NomineeDetailsComponent, BankAccountDetailsComponent, SegmentBrokerageComponent, AddressDetailsComponent, PersonalDetailsComponent, DeclarationsComponent, SignaturePhotographComponent, DocumentsUploadComponent, EsignConfirmComponent, WelcomeUserComponent]
})
export class SideNavComponent implements OnInit {
  @ViewChild('openMobileMenuInfo') openMobileMenuInfo: any;

  activeTab: string;
  initialActiveTab: string;
  loggedInUserData: any;
  verifiedSteps: any = {};
  commonConfigFlow: any;
  contentData: any;

  subscribeflowData: Subscription;
  subscribeGetStepsInfo: Subscription;
  subscribeContentData: Subscription;
  subscribeLoggedUserInfoValue: Subscription;
  subscribeActiavePageInfo: Subscription;

  timeLeft: number = 60;
  interval;
  currentUrl: any;
  private previousUrl: string = undefined;
  totalStep: number = 8;
  bankStepNo = 4;
  declarationStepNo = 5;
  SignaturePhotoGraphStepNo = 6;
  DocumentUploadStepNo = 7;
  EsignConfirmNo = 8;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    public global: GlobalService,
    private serviceVarService: SharedVarService,
    private dashboardService: DashboardService,
    private cookieService: CookieService,
    private authGuard: AuthGuard
  ) {
    const stepInfo = this.route.snapshot.data["getStepData"];
    if (stepInfo.success) {
      this.serviceVarService.setStepsInfo(stepInfo.result);
      this.verifiedSteps = stepInfo.result;
    } else {
      this.authGuard.deleteTokenAndRedirectToLogin();
    }

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        // console.log('this.previousUrl', this.previousUrl)
        // console.log('currentUrl---', this.currentUrl)
        if (this.previousUrl !== this.currentUrl) {
          // let currentUrl = this.currentUrl;
          // currentUrl = currentUrl.replace('a', '');
          // if(currentUrl === 'signature-photograph' || currentUrl === 'signature-photograph'){
          //   this.startTimer(180);
          // } else { }
          this.startTimer(120);
        }
      };
    });
  }


  ngOnInit(): void {
    this.subscribeContentData = this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
    });

    this.subscribeGetStepsInfo = this.serviceVarService.getStepsInfo().subscribe((value) => {
      if (!value && this.cookieService.get('user_auth_token')) { // get steps info from api
        this.dashboardService.getStepsInfo().subscribe((res) => {
          if (res.success) {
            res['result']['isUsedKRA'] = true;
            this.serviceVarService.setStepsInfo(res.result);
            this.verifiedSteps = res.result;

          }
        });
      } else {
        value['isUsedKRA'] = true;
        this.verifiedSteps = value;
        if (!this.verifiedSteps?.step_3) {
          this.router.navigate(['register-email']);
        } else if (!this.verifiedSteps?.step_4) {
          this.router.navigate(['register-pan-dob']);
        }
      }
    });
    // const obj = { 'isAadharVerified': false, 'isPanVerified': false, 'tranding_account_type': false };
    // this.serviceVarService.setStepsInfo(obj);
    let type;
    if (this.router.url) {
      type = this.router.url.split('/').pop();
    }
    if (type.includes("?")) {
      type = type.split("?")[0];
    }
    this.activeTab = type;
    this.initialActiveTab = type;
    this.serviceVarService.setActivePageInfoValue(type);
    this.subscribeActiavePageInfo = this.serviceVarService.getActivePageInfoValue().subscribe((value) => {
      this.activeTab = value;
      this.initialActiveTab = value;
    });

    this.subscribeLoggedUserInfoValue = this.serviceVarService.getLoggedUserInfoValue().subscribe((value) => {
      this.loggedInUserData = value;
    });

    this.subscribeflowData = this.serviceVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      } else {
        this.global.setConfigFlow();
      }
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      // this.startTimer(120);
      this.currentUrl = event.url.split('/').pop();
      // console.log('currentUrl', currentUrl);
    });

    if (!this.verifiedSteps?.isNominatedVerified && !this.verifiedSteps?.ispersonalDetailsVerified) {
      this.totalStep = 7;
    } else if (!this.verifiedSteps?.isNominatedVerified && this.verifiedSteps?.ispersonalDetailsVerified) {
      this.totalStep = 8;
    } else if (this.verifiedSteps?.isNomineeSkiped) {
      this.totalStep = 7;
    } else {
      this.totalStep = 8;
    }
    if (this.totalStep === 7) {
      this.bankStepNo = 3;
      this.declarationStepNo = 4;
      this.SignaturePhotoGraphStepNo = 5;
      this.DocumentUploadStepNo = 6;
      this.EsignConfirmNo = 7;
    }

  }

  startTimer(startFrom: number) {
    clearInterval(this.interval);
    this.timeLeft = startFrom;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = startFrom;
      }
    }, 1000);
  }

  /**
   * Navigate as per side nav
   */
  navigate(type: string) {
    this.activeTab = type;
    // console.log('navigate', type);
    this.router.navigate([type]);
    this.global.onActivate();
  }

  openMobileMenu() {
    this.modalService.open(this.openMobileMenuInfo, { centered: true, windowClass: 'profile-popup', backdrop: 'static', keyboard: false }).result.then((result) => {
      // console.log('openMobileMenuInfo');
    });
  }

  ngOnDestroy(): void {
    // console.log('subscribeActiavePageInfo');
    this.subscribeflowData && this.subscribeflowData.unsubscribe();
    this.subscribeGetStepsInfo && this.subscribeGetStepsInfo.unsubscribe();
    this.subscribeContentData && this.subscribeContentData.unsubscribe();
    this.subscribeLoggedUserInfoValue && this.subscribeLoggedUserInfoValue.unsubscribe();
    this.subscribeActiavePageInfo && this.subscribeActiavePageInfo.unsubscribe();
  }
}
