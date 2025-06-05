import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
// import { CookiesService } from '@ngx-utils/cookies';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { Subject, Subscription, interval, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-under-review',
  templateUrl: './under-review.component.html',
  styleUrls: ['./under-review.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class UnderReviewComponent implements OnInit {
  loggedInUserData: any;
  verifiedSteps: any;
  contentData: any;
  thankYouContent: any;
  commonConfigFlow: any
  dataSubscription: Subscription;
  getLoggedUserInfoValue: Subscription;
  getSiteContentData: Subscription;
  getStepsInfo: Subscription;
  subscribeflowData: Subscription;

  constructor(
    private router: Router,
    public global: GlobalService,
    private cookieService: CookieService,
    private serviceVarService: SharedVarService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.getLoggedUserInfoValue = this.serviceVarService.getLoggedUserInfoValue().subscribe((value) => {
      this.loggedInUserData = value;
    });

    this.getSiteContentData = this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.thankYouContent = data?.thank_you_content;
        // console.log('this.thankYouContent', this.thankYouContent);
      }
    });

    this.subscribeflowData = this.serviceVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      } else {
        this.global.setConfigFlow();
      }
    });

    this.getStepsInfo = this.serviceVarService.getStepsInfo().subscribe((value) => {
      if (!value && this.cookieService.get('user_auth_token')) { // get steps info from api
        this.checkGetStepInfo();
      } else {
        this.verifiedSteps = value;
      }
    });

    this.getStepInfo();
    const numbers = interval(1000 * 60 * environment.autoRefresh);
    const takeNumbers = numbers.pipe(take(5));
    this.dataSubscription = takeNumbers.subscribe(x => {
      this.getStepInfo();
    });
    this.global.logEventUserExperior("Thank you for EKYC");
    // this.dataSubscription = interval(1000 * 60 * 5).subscribe(x => {
    //   this.getStepInfo();
    // });

  }

  getStepInfo() {
    this.dashboardService.getStepsInfo().subscribe((res) => {
      if (res.success) {
        this.serviceVarService.setStepsInfo(res.result);
        this.verifiedSteps = res.result;
        if (res?.result?.isEKYCComplete === 0) {
          this.global.redirectToLastVerifiedPage(res?.result, this.commonConfigFlow);
        }
      }
    })
  }

  checkGetStepInfo() {
    this.dashboardService.getStepsInfo().subscribe((res) => {
      if (res.success) {
        this.serviceVarService.setStepsInfo(res.result);
        this.verifiedSteps = res.result;
        if (res?.result?.isEKYCComplete === 0) {
          this.global.redirectToLastVerifiedPage(res?.result, this.commonConfigFlow);
        }
      }
    })

  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.getLoggedUserInfoValue.unsubscribe();
    this.getSiteContentData.unsubscribe();
    this.getStepsInfo.unsubscribe();
    this.subscribeflowData.unsubscribe();
  }
}
