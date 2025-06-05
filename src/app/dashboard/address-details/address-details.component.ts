import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { DashboardService } from '../dashboard.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
//  import { NgxMaskModule } from 'ngx-mask';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

declare var $: any;
@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrls: ['./address-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, ControlMessagesComponent, NgxMaskDirective, NgxMaskPipe],
  providers: [provideNgxMask()]
})
export class AddressDetailsComponent implements OnInit {
  addDetail: any = {};
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;
  addressKnowMore = `${environment.addressKnowMore}`;
  public addressDetailsform: UntypedFormGroup;
  addAddress: boolean;
  perAddress: boolean;
  permanentAddress: any;
  stateList = [];
  cityList = [];
  permanentCityList = [];
  permanentStateList = [];

  // Create PDF
  cols: Array<any> = [{
    title: "Details",
    dataKey: 'details'
  }, {
    title: "Values",
    dataKey: 'values'
  }];
  rows: Array<any> = [];
  commonConfigFlow: any;
  addressDetailsContent: any;

  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    public validate: ValidationService,
    public dashboardService: DashboardService,
    public global: GlobalService,
    private serviceVarService: SharedVarService,
    public translate: TranslateService
  ) {

  }

  ngOnInit(): void {
    setTimeout(async () => {
      if (this.verifiedSteps && this.verifiedSteps.isApproved) {
        this.global.checkIsApplicationApprove(this.verifiedSteps); return;
      }
    }, 500);
    const requiredPINCode = ['', Validators.compose([Validators.required, ValidationService.pincodeValidator])];
    this.addressDetailsform = this.fb.group({
      address_line1: new UntypedFormControl(''),
      address_line2: new UntypedFormControl(''),
      // address_line3: new UntypedFormControl(''),
      city: new UntypedFormControl(''),
      state: new UntypedFormControl(''),
      pin_code: new UntypedFormControl(''),
      country: new UntypedFormControl('INDIA'),
      same_as: new UntypedFormControl(true),
      per_address_line1: new UntypedFormControl(''),
      per_address_line2: new UntypedFormControl(''),
      // per_address_line3: new UntypedFormControl(''),
      per_city: new UntypedFormControl(''),
      per_state: new UntypedFormControl(''),
      per_pin_code: new UntypedFormControl(''),
      per_country: new UntypedFormControl('INDIA')
    });
    this.isAccessibleNav();

    this.serviceVarService.getConfigFlowData().subscribe((res: any) => {
      this.commonConfigFlow = res;
    })
    if (this.contentData?.data) {
      const data = JSON.parse(this.contentData?.data);
      this.addressDetailsContent = data?.address_details_content;
    }

    this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.addressDetailsContent = data?.address_details_content;
      }
    });
  }

  isAccessibleNav() {

    if (this.verifiedSteps.mf_app) {
      if (this.verifiedSteps.hasOwnProperty('ispersonalDetailsVerified') && !this.verifiedSteps?.ispersonalDetailsVerified) {
        setTimeout(() => {
          if (this.global.checkForMFAPP(this.verifiedSteps)) {
            this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
          }
        }, 500);
      } else {
        this.getAddressDetails();
      }
    } else {
      this.getAddressDetails();
    }
  }

  /**
   * Get address details
   */
  getAddressDetails() {
    this.global.globalLoader(true);
    this.dashboardService.getAddressDetails().subscribe((res) => {
      // console.log('res', res);
      if (res.success) {
        this.global.globalLoader(false);
        this.perAddress = false;
        // if (res.result.stateList) {
        //   this.stateList = res.result.stateList;
        // }
        // this.verifiedSteps.isAadharVerified = true;
        if (!this.verifiedSteps.isPanVerified) { // if aadhar not verified by KRA
          this.perAddress = true;
          this.addPermanentValidation();
          // this.addressDetailsform.patchValue({ same_as: false });
          // this.addAddress = true;
          // this.addCorrespondenceAddress();
          if (res.result.address_line1) {
            this.addressDetailsform.patchValue({ per_address_line1: res.result.address_line1 });
          }
          if (res.result.address_line2) {
            this.addressDetailsform.patchValue({ per_address_line2: res.result.address_line2 });
          }
          // if (res.result.address_line3) {
          //   this.addressDetailsform.patchValue({ per_address_line3: res.result.address_line3 });
          // }
          if (res.result.pin_code) {
            this.checkPincodePermanent(res.result.pin_code, false); // get city, state list
            this.addressDetailsform.patchValue({ per_pin_code: res.result.pin_code });
          }
          if (res.result.city) {
            this.addressDetailsform.patchValue({ per_city: res.result.city });
          }
          if (res.result.state) {
            this.addressDetailsform.patchValue({ per_state: res.result.state });
          }
          if (res.result.country) {
            this.addressDetailsform.patchValue({ per_country: res.result.country.toUpperCase() });
          }
        }
        // else { // if aadhar verified by KRA
        this.permanentAddress = res.result;
        if (res?.result?.is_corres_same_permanent === 0) {
          this.addAddress = true;
          this.checkPincodeCorrespodence(res?.result?.userAddressData?.pin_code, false); // get city, state list
          let country = '';
          if (res.result.userAddressData?.country) {
            country = res.result.userAddressData?.country?.toUpperCase()
          }
          this.addressDetailsform.patchValue({ same_as: false });
          this.addressDetailsform.patchValue({
            // same_as: false,
            address_line1: res.result.userAddressData?.address_line1,
            address_line2: res.result.userAddressData?.address_line2,
            // address_line3: res.result.userAddressData?.address_line3,
            city: res.result.userAddressData?.city,
            state: res.result.userAddressData?.state,
            pin_code: res.result.userAddressData?.pin_code,
            country: country,
          });
        } else {
          this.addressDetailsform.patchValue({ same_as: true });
        }
      } else {
        if (!this.verifiedSteps.ispersonalDetailsVerified && this.global.checkForMFAPP(this.verifiedSteps)) {
          this.global.errorToastr(res.message);
          this.global.redirectToLastVerifiedPage(this.verifiedSteps);
        }
        if (!this.verifiedSteps.isPanVerified) { // if aadhar not verified by KRA,Digilocker
          this.perAddress = true;
          this.addressDetailsform.patchValue({ same_as: false });
          this.addCorrespondenceAddress();
          this.perAddress = true;
          this.addPermanentValidation();
        }
      }
    });
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

  createPdf(extraData: any = '') {
    let arrayOfData = {};
    arrayOfData['Address line 1'] = extraData?.address_line1 || '';
    arrayOfData['Address line 2'] = extraData?.address_line2 || '';
    // arrayOfData['Address line 3'] = extraData?.address_line3 || '';
    arrayOfData['City'] = extraData?.city || '';
    arrayOfData['State'] = extraData?.state || '';
    arrayOfData['Pin Code'] = extraData?.pin_code || '';
    arrayOfData['Country'] = extraData?.country || '';

    this.rows = Object.keys(arrayOfData).map((key) => {
      return { 'details': key, 'values': arrayOfData[key] };
    });

    let docs: any = new jsPDF();
    docs.setFontSize(18);
    docs.text('Permanent Address Proof', 15, 15);
    docs.autoTable(this.cols, this.rows, this.optionsContainer['horizontal']);
    // Open PDF document in new tab
    var blob = docs.output('blob');
    let uploadParam: any = new FormData();
    uploadParam.append('document_name', 'permanent_address');
    uploadParam.append('file[]', blob, 'permanent.pdf');
    uploadParam.append('isKRAVerified', true);
    // uploadParam.append('files', queue);
    this.dashboardService.uploadDocument(uploadParam).subscribe((res: any) => {
      // console.log('res', res);
    });
    // Download PDF document  
    // docs.save('table.pdf');
  }
  /*************** Create PDF/BLOB: END *****************/

  /**
  * Submit form
  */
  onSubmit() {
    // console.log('test', this.addressDetailsform); return;
    if (this.addressDetailsform.valid) {
      let obj = {};
      if (this.addAddress) {
        obj['address_line1'] = this.addressDetailsform.value.address_line1;
        obj['address_line2'] = this.addressDetailsform.value.address_line2;
        // obj['address_line3'] = this.addressDetailsform.value.address_line3;
        obj['city'] = this.addressDetailsform.value.city;
        obj['state'] = this.addressDetailsform.value.state;
        obj['pin_code'] = this.addressDetailsform.value.pin_code;
        obj['country'] = this.addressDetailsform.value.country;
        obj['same_as_parmanent'] = false;
      } else {
        obj['same_as_parmanent'] = true;
      }

      if (this.perAddress) {
        obj['per_address_line1'] = this.addressDetailsform.value.per_address_line1;
        obj['per_address_line2'] = this.addressDetailsform.value.per_address_line2;
        obj['per_city'] = this.addressDetailsform.value.per_city;
        obj['per_state'] = this.addressDetailsform.value.per_state;
        // obj['per_address_line3'] = this.addressDetailsform.value.per_address_line3;
        obj['per_pin_code'] = this.addressDetailsform.value.per_pin_code;
        obj['per_country'] = this.addressDetailsform.value.per_country;
      }

      this.dashboardService.addAddressDetails(obj).subscribe((res: any) => {
        if (res.success) {
          this.global.successToastr(res.message);
          if (!this.verifiedSteps.isAddressVerified && this.verifiedSteps.isKRAVerified) {
            this.createPdf(this.permanentAddress);
          }
          this.verifiedSteps['isAddressVerified'] = true;
          this.serviceVarService.setStepsInfo(this.verifiedSteps);
          this.dashboardService.getStepsInfo().subscribe((res) => {
            if (res.success) {
              this.serviceVarService.setStepsInfo(res.result);
              this.verifiedSteps = res.result;
              // this.global.redirectToPage('bank-account-details');
            }
          });
          if (this.global.checkForMFAPP(this.verifiedSteps)) { // for MF app
            if (this.commonConfigFlow.isSegmentSkip) {
              this.global.redirectToPage('nominee-details');
            } else {
              this.global.redirectToPage('segment-brokerage');
            }
          } else {
            this.global.redirectToPage('bank-account-details');
          }
        } else {
          this.global.errorToastr(res.message);
        }
      });
    } else {
      this.validate.validateAllFormFields(this.addressDetailsform);
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
    }
  }

  /**
   * Check for same as permenent
   */
  checkForSameAsPermenent(event) {
    if (event.target.checked) {
      this.addressDetailsform.get('same_as').setValue(true);
      this.addAddress = false;
      const arrayFields = ['address_line1', 'city', 'state', 'pin_code', 'country'];
      arrayFields.map((item) => {
        // this.addressDetailsform.get(item).setValue('');
        this.addressDetailsform.get(item).clearValidators();
        this.addressDetailsform.get(item).updateValueAndValidity();
      });
    } else {
      this.addAddress = true;
      const arrayFields = ['address_line1', 'city', 'state'];
      arrayFields.map((item) => {
        this.addressDetailsform.get(item).setValidators([Validators.required]);
        this.addressDetailsform.get(item).updateValueAndValidity();
      });
      this.addressDetailsform.get('pin_code').setValidators([Validators.required, ValidationService.pincodeValidator]);
      this.addressDetailsform.get('pin_code').updateValueAndValidity();
      this.addressDetailsform.get('country').setValue('INDIA');
      this.addressDetailsform.get('country').setValidators([Validators.required]);
      this.addressDetailsform.get('country').updateValueAndValidity();
      this.addressDetailsform.get('same_as').setValue(false);
    }
  }

  /**
   * Add permanent address
   */
  addPermanentValidation() {
    const arrayFields = ['per_address_line1', 'per_city', 'per_state'];
    arrayFields.map((item) => {
      this.addressDetailsform.get(item).setValidators([Validators.required]);
      this.addressDetailsform.get(item).updateValueAndValidity();
    });
    this.addressDetailsform.get('per_pin_code').setValidators([Validators.required, ValidationService.pincodeValidator]);
    this.addressDetailsform.get('per_pin_code').updateValueAndValidity();
    this.addressDetailsform.get('per_country').setValue('INDIA');
    this.addressDetailsform.get('per_country').setValidators([Validators.required]);
    this.addressDetailsform.get('per_country').updateValueAndValidity();
  }

  /**
   * Add correspondence address (required)
   */
  addCorrespondenceAddress() {
    this.addAddress = true;
    const arrayFields = ['address_line1', 'city', 'state'];
    arrayFields.map((item) => {
      this.addressDetailsform.get(item).setValidators([Validators.required]);
      this.addressDetailsform.get(item).updateValueAndValidity();
    });
    // this.addressDetailsform.get('per_pin_code').setValue('');
    this.addressDetailsform.get('pin_code').setValidators([Validators.required, ValidationService.pincodeValidator]);
    this.addressDetailsform.get('pin_code').updateValueAndValidity();
    this.addressDetailsform.get('country').setValue('INDIA');
    this.addressDetailsform.get('country').setValidators([Validators.required]);
    this.addressDetailsform.get('country').updateValueAndValidity();
  }

  /**
   * Get State, city list of correspondene
   * @param $event 
   * @param target 
   */
  stateDisabled: boolean;
  checkPincodeCorrespodence($event, target = true) {
    this.stateDisabled = false;
    if (target) {
      if ($event.target.value && $event.target.value.length > 5) {
        const objParam = { pincode: $event.target.value };
        this.dashboardService.checkPinCode(objParam).subscribe((res: any) => {
          if (res.success) {
            this.cityList = [];
            this.cityList = res.result;
            this.stateList = [];
            this.stateList.push(res.result[0]);
            setTimeout(() => {
              if (this.stateList.length) {
                this.addressDetailsform.patchValue({ city: res.result[0].city_name, state: res.result[0].state_name });
                this.stateDisabled = true;
              }
            }, 500);
          }
        })
      }
    } else {
      if ($event > 5) {
        const objParam = { pincode: $event };
        this.dashboardService.checkPinCode(objParam).subscribe((res: any) => {
          if (res.success) {
            this.cityList = [];
            this.cityList = res.result;
            this.stateList = [];
            this.stateList.push(res.result[0]);
            this.addressDetailsform.patchValue({ city: res.result[0].city_name, state: res.result[0].state_name });
            this.stateDisabled = true;
          }
        })
      }
    }
  }

  /**
   * Get State, city list of Permanent address
   * @param $event 
   * @param target 
   */
  checkPincodePermanent($event, target = true) {
    if (target) {
      if ($event.target.value && $event.target.value.length > 5) {
        const objParam = { pincode: $event.target.value };
        this.dashboardService.checkPinCode(objParam).subscribe((res: any) => {
          if (res.success) {
            this.permanentCityList = [];
            this.permanentCityList = res.result;
            this.permanentStateList = [];
            this.permanentStateList.push(res.result[0]);
            setTimeout(() => {
              if (this.permanentStateList.length) {
                this.addressDetailsform.patchValue({ per_city: res.result[0].city_name, per_state: res.result[0].state_name });
              }
            }, 500);
          }
        })
      }
    } else {
      if ($event > 5) {
        const objParam = { pincode: $event };
        this.dashboardService.checkPinCode(objParam).subscribe((res: any) => {
          if (res.success) {
            this.permanentCityList = [];
            this.permanentCityList = res.result;
            this.permanentStateList = [];
            this.permanentStateList.push(res.result[0]);
            this.addressDetailsform.patchValue({ per_city: res.result[0].city_name, per_state: res.result[0].state_name });
          }
        })
      }
    }
  }

}
