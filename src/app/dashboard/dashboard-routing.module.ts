import { SignaturePhotographComponent } from './signature-photograph/signature-photograph.component';
import { NgModule, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Routes, RouterModule, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { WelcomeUserComponent } from './welcome-user/welcome-user.component';
import { AuthGuard } from '../guard/auth.guard';
import { SideNavComponent } from './side-nav/side-nav.component';
import { PanDetailsComponent } from './pan-details/pan-details.component';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';
import { AddressDetailsComponent } from './address-details/address-details.component';
import { BankAccountDetailsComponent } from './bank-account-details/bank-account-details.component';
import { DocumentsUploadComponent } from './documents-upload/documents-upload.component';
import { DigilockerRedirectComponent } from './digilocker-redirect/digilocker-redirect.component';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { Observable } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { SharedVarService } from '../services/sharedVar.service';
import { SegmentBrokerageComponent } from './segment-brokerage/segment-brokerage.component';
import { NomineeDetailsComponent } from './nominee-details/nominee-details.component';
import { EsignConfirmComponent } from './esign-confirm/esign-confirm.component';
import { DeclarationsComponent } from './declarations/declarations.component';

@Injectable({ providedIn: 'root' })
export class redirectResolver implements Resolve<any> {
  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      this.dashboardService.getStepsInfo().subscribe((res: any) => {
        if (res.success) {
          if (res?.result?.isEKYCComplete === 1) {
            this.router.navigate(['thank-you']);
            resolve(true);
          } else {
            this.sharedVarService.setStepsInfo(res?.result);
            resolve(res);
          }
        }
      }, error => {
        resolve(false);
      });
    });
    // const returnData = this.dashboardService.getStepsInfo();
    // return returnData;
  }
}

@Injectable({ providedIn: 'root' })
export class approveResolver implements Resolve<any> {
  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {

      this.sharedVarService.getStepsInfo().subscribe((verifiedSteps: any) => {
        // console.log('getData');
        if (verifiedSteps?.isEKYCComplete === 1) {
          this.router.navigate(['thank-you']);
          resolve(true);
        } else if (verifiedSteps?.isApproved) {
          // this.sharedVarService.setStepsInfo(verifiedSteps);
          this.router.navigate(['esign-confirm']);
          resolve(false);
        } else {
          resolve(true);
        }
      });

    });
    // const returnData = this.dashboardService.getStepsInfo();
    // return returnData;
  }
}


const routes: Routes = [
  {
    // canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    path: '',
    component: SideNavComponent,
    children: [
      {
        path: 'welcome',
        component: WelcomeUserComponent,
        data: { title: 'Welcome' },
      },
      {
        path: 'pan-details',
        component: PanDetailsComponent,
        data: { title: 'pan-details' },
      },
      {
        path: 'personal-details',
        component: PersonalDetailsComponent,
        data: { title: 'personal-details' }
      },
      {
        path: 'address-details',
        component: AddressDetailsComponent,
        data: { title: 'address-details' }
      },
      {
        path: 'segment-brokerage',
        component: SegmentBrokerageComponent,
        data: { title: 'segment-brokerage' }
      },
      {
        path: 'nominee-details',
        component: NomineeDetailsComponent,
        data: { title: 'nominee-details' }
      },
      {
        path: 'bank-account-details',
        component: BankAccountDetailsComponent,
        data: { title: 'bank-account-details' }
      },
      {
        path: 'declarations',
        component: DeclarationsComponent,
        data: { title: 'declarations' },
      },
      {
        path: 'signature-photograph',
        component: SignaturePhotographComponent,
        data: { title: 'signature and photograph' },
      },
      {
        path: 'documents-upload',
        component: DocumentsUploadComponent,
        data: { title: 'documents-upload' },
      },
      {
        path: 'esign-confirm',
        component: EsignConfirmComponent,
        data: { title: 'esign-confirm' },
      }
    ],
    resolve: {
      getStepData: redirectResolver
    },
  },
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'redirect',
        component: DigilockerRedirectComponent,
        // resolve: {
        // getData: redirectResolver
        // },
        data: { title: 'Welcome back', hideNavbar: true },
      },
      // {
      //   path: 'disclaimer',
      //   component: DisclaimerComponent,
      //   data: { title: 'Disclaimer' },
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
