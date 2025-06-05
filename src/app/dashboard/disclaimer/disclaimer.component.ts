import { Component, OnInit, Input } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss'],
  standalone: true,
  imports: [TranslateModule]
})
export class DisclaimerComponent implements OnInit {
  isBankObj: any;
  @Input() verifiedSteps: any;


  constructor(
    private router: Router,
    private serviceVarService: SharedVarService,
    private dashboardService: DashboardService,
    public global: GlobalService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.serviceVarService.getBankInfoValue().subscribe((res: any) => {
      this.isBankObj = res;
    });

    this.serviceVarService.getStepsInfo().subscribe((result) => {
      this.verifiedSteps = result;
    });
  }


  navigate(type: string) {
    this.router.navigate([type]);
    this.global.onActivate();
    this.serviceVarService.setActivePageInfoValue(type);
  }

  proceedToSubmit() {
    if (this.isBankObj) {
      this.dashboardService.submitBankDetails(this.isBankObj).subscribe((res: any) => {
        if (res.success) {
          this.serviceVarService.setBankInfoValue('');
          this.verifiedSteps['isBankAccountVerified'] = true;
          this.serviceVarService.setStepsInfo(this.verifiedSteps);
          this.dashboardService.getStepsInfo().subscribe((res) => {
            if (res.success) {
              this.serviceVarService.setStepsInfo(res.result);
            }
          });
          const type = 'documents-upload';
          this.global.successToastr(res.message);
          this.global.redirectToPage(type);
        } else {
          this.global.errorToastr(res.message);
          this.router.navigate(['bank-account-details']);
        }
      });
    } else {
      this.global.errorToastr(this.translate.instant('Data_Not_Found'));
      this.router.navigate(['bank-account-details']);
    }
  }

}
