import { Component, OnInit, Input, ViewChild, EventEmitter, Output, Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { DashboardService } from '../dashboard.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { NgbModal, NgbDatepicker, NgbCalendar, NgbDatepickerConfig, NgbDateAdapter, NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/shared/customeAdapter';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";


@Component({
  selector: 'app-pan-details',
  templateUrl: './pan-details.component.html',
  styleUrls: ['./pan-details.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, NgbModule, ControlMessagesComponent]
})
export class PanDetailsComponent implements OnInit {
  @Output() restartPopUpEvent = new EventEmitter<any>();
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  public panDetailsform: UntypedFormGroup;
  @ViewChild('content') downgradeModal: any;
  @ViewChild('dp') dp: NgbDatepicker;

  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    public validate: ValidationService,
    public dashboardService: DashboardService,
    private modalService: NgbModal,
    config: NgbDatepickerConfig,
    private calendar: NgbCalendar,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    private ngbCalendar: NgbCalendar,
    private dateAdapter: NgbDateAdapter<string>,
    public translate: TranslateService
  ) {
    const currentDate = new Date();
    config.minDate = { year: 1947, month: 1, day: 1 };
    config.maxDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    config.outsideDays = 'hidden';
  }

  ngOnInit(): void {
    setTimeout(async () => {
      if (this.verifiedSteps && this.verifiedSteps.isApproved) {
        this.global.checkIsApplicationApprove(this.verifiedSteps); return;
      }
    }, 500);
    const panNumber = new UntypedFormControl('', [ValidationService.required]);
    const dob = new UntypedFormControl('', [ValidationService.required]);
    this.panDetailsform = this.fb.group({
      dob: dob,
      panNumber: panNumber,
    });
    this.isAccessibleNav();
  }

  isAccessibleNav() {
    // if (this.verifiedSteps.hasOwnProperty('isAadharVerified') && !this.verifiedSteps?.isAadharVerified) {
    //   this.global.errorToastr("Please verify Aadhaar details");
    //   this.global.onActivate();
    //   setTimeout(() => {
    //     this.sharedVarService.setActivePageInfoValue('aadhaar-details');
    //   }, 500);
    //   this.router.navigate(['aadhaar-details']);
    // } else {
    this.getSetPanDetails();
    // }
  }

  /**
   * getter setter pan details 
   */
  getSetPanDetails() {
    // this.sharedVarService.getAadharPanInfoValue().subscribe((item: any) => {
    //   if (item.aadharNumber) {
    //     this.panDetailsform.patchValue({ panNumber: item.panNumber });
    //   } else { // api call for get aadhar pan details
    this.dashboardService.getAadharPanDetails().subscribe((res: any) => {
      if (res.success) {
        this.panDetailsform.patchValue({ panNumber: res.result.panNumber });
        if (res.result.dateOfBirth) {
          const dateOfBirth = res.result.dateOfBirth;
          const d = dateOfBirth.split("-");
          const dobdate = `${d[0]}/${d[1]}/${d[2]}`;
          this.panDetailsform.patchValue({ dob: dobdate });
        }
      } else {
        this.global.errorToastr(res.message);
        // this.global.onActivate();
        // this.sharedVarService.setActivePageInfoValue('aadhaar-details');
        // this.router.navigate(['pan-details']);
      }
    });
    //   }
    // });
  }

  openRestartPopup() {
    this.restartPopUpEvent.emit()
  }

  /**
  * Submit form to get aadhar details
  */
  onSubmit() {
    if (this.verifiedSteps.isPanVerified) {
      const type: string = 'personal-details';
      this.router.navigate([type]);
      this.global.onActivate();
      this.sharedVarService.setActivePageInfoValue(type);
    } else {
      this.modalService.open(this.downgradeModal, { centered: true }).result.then((result) => {
        if (result === 'ok') {
          this.verifyPanDetails();
        }
      });
    }
  }

  /**
  * Submit form to PAN details
  */
  verifyPanDetails() {
    if (this.panDetailsform.valid) {
      const panNumber = this.panDetailsform.value.panNumber;
      const obj = {
        panNumber: panNumber.toUpperCase(),
        dateOfBirth: this.panDetailsform.value.dob,
      };
      this.dashboardService.verifyPanNumber(obj).subscribe((res: any) => {
        if (res.success) {
          this.global.successToastr(res.message);
          this.verifiedSteps['isPanVerified'] = true;
          this.sharedVarService.setStepsInfo(this.verifiedSteps);
          this.dashboardService.getStepsInfo().subscribe((res) => {
            if (res.success) {
              this.sharedVarService.setStepsInfo(res.result);
            }
          });
          // this.router.navigate(['personal-details']);
          this.global.redirectToPage('personal-details');
        } else {
          this.global.errorToastr(res.message);
        }
      });
    } else {
      this.validate.validateAllFormFields(this.panDetailsform);
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
    }
  }

}
