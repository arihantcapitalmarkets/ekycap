import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { ValidationService } from 'src/app/services/validation.service';
import { NgbModal, NgbDatepicker, NgbCalendar, NgbDatepickerConfig, NgbDateAdapter, NgbDateParserFormatter, NgbModalRef, NgbModule, NgbNavModule, NgbNavItem, NgbNav, NgbNavContent, NgbDatepickerModule, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/shared/customeAdapter';
import { DashboardService } from '../dashboard.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GetValueCheck } from 'src/app/shared/pipes/mobCharReplace';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-nominee-details',
  templateUrl: './nominee-details.component.html',
  styleUrls: ['./nominee-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, NgbModule, ControlMessagesComponent, NgbNavModule, NgbNavItem, NgbNav, NgbNavContent, NgbDatepickerModule, NgxMaskPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    provideNgxMask()
  ],

})
export class NomineeDetailsComponent implements OnInit {
  @ViewChild('deleteNominee') deleteNominee: ElementRef;
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;
  @ViewChild('dp') dp: NgbDatepicker;
  @ViewChild('maskedInput', { static: true }) maskedInput!: ElementRef;

  isNomineeAvailable: boolean = false;
  countNominee = 1;
  navs = [1, 2, 3];
  value: string | undefined;

  nomineeForm: UntypedFormGroup;
  items: UntypedFormArray;
  addAddress: boolean;
  percentageError: any;
  commonConfigFlow: any;
  nomineeDetailsContent: any;
  nomineeDocumentUploadNote: any;
  getNomineeInfoData: any;
  nominee1State: any;
  nominee1CityList: any;
  nominee2State: any;
  nominee2CityList: any;
  nominee3State: any;
  nominee3CityList: any;
  isLoading: boolean;
  active: number | string = 0;


  tabs = [1, 2, 3, 4, 5];
  counter = this.tabs.length + 1;
  activeTab: number = 0;

  relationShipDropDown = [
    { label: 'Spouse', value: 'Spouse' },
    { label: 'Son', value: 'Son' },
    { label: 'Daughter', value: 'Daughter' },
    { label: 'Mother', value: 'Mother' },
    { label: 'Father', value: 'Father' },
    { label: 'Brother', value: 'Brother' },
    { label: 'Sister', value: 'Sister' },
    { label: 'Grand-Son', value: 'Grand-Son' },
    { label: 'Grand-Daughter', value: 'Grand-Daughter' },
    { label: 'Grand-Father', value: 'Grand-Father' },
    { label: 'Grand-Mother', value: 'Grand-Mother' },
    // { label: 'Not Provided', value: 'Not Provided' },
    { label: 'Others', value: 'Others' },
  ]
  constructor(
    public fb: UntypedFormBuilder,
    private ref: ChangeDetectorRef,
    config: NgbInputDatepickerConfig,
    private router: Router,
    private modalService: NgbModal,
    private global: GlobalService,
    public validate: ValidationService,
    public dashboardService: DashboardService,
    private sharedVarService: SharedVarService,
    public translate: TranslateService,
    private getValueCheck: GetValueCheck
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
    this.addAddress = false;
    if (this.contentData?.data) {
      const data = JSON.parse(this.contentData?.data);
      this.nomineeDetailsContent = data?.nominee_details_content;
    }
    this.sharedVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.nomineeDetailsContent = data?.nominee_details_content;
        this.nomineeDocumentUploadNote = data?.nominee_document_upload_note;
      }
    });

    this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
      if (res) {
        this.commonConfigFlow = res;
      }
    });
    setTimeout(() => {
      this.isAccessibleNav();
    }, 1000);
  }


  close(event: MouseEvent, toRemove: number) {
    this.tabs = this.tabs.filter((id) => id !== toRemove);
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  add(event: MouseEvent) {
    this.tabs.push(this.counter++);
    event.preventDefault();
  }
  /**
  * validate navigation
  */
  isAccessibleNav() {
    this.global.logEventUserExperior("Landing On Nominee Details Screen");
    if (this.commonConfigFlow?.isSegmentSkip) {
      if (this.verifiedSteps.hasOwnProperty('isAddressVerified') && !this.verifiedSteps?.isAddressVerified) {
        setTimeout(() => {
          this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
        }, 500);
      } else {
        // console.log('isNominatedVerified', this.verifiedSteps?.isNominatedVerified, 'isNomineeSkiped', this.verifiedSteps?.isNomineeSkiped);
        if (this.verifiedSteps.hasOwnProperty('isNominatedVerified') && this.verifiedSteps?.isNominatedVerified) {
          this.isNomineeAvailable = false;
          if (this.verifiedSteps?.isNominatedVerified && !this.verifiedSteps?.isNomineeSkiped) {
            this.switchToNominee();
          }
        } else {
          this.isLoading = true;
          this.isNomineeAvailable = true;
          this.countNominee = 1;
          this.setForm();
        }
      }
    } else {
      if (this.verifiedSteps.hasOwnProperty('isTrandingAccountType') && !this.verifiedSteps?.isTrandingAccountType) {
        this.global.errorToastr(this.translate.instant('Please_Select_Segment_Plans'));
        this.global.onActivate();
        setTimeout(() => {
          this.sharedVarService.setActivePageInfoValue('segment-brokerage');
        }, 500);
        this.router.navigate(['segment-brokerage']);
      }
      else {
        // console.log('isNominatedVerified', this.verifiedSteps?.isNominatedVerified, 'isNomineeSkiped', this.verifiedSteps?.isNomineeSkiped);
        if (this.verifiedSteps.hasOwnProperty('isNominatedVerified') && this.verifiedSteps?.isNominatedVerified) {
          this.isNomineeAvailable = false;
          if (this.verifiedSteps?.isNominatedVerified && !this.verifiedSteps?.isNomineeSkiped) {
            this.switchToNominee();
          }
        }
      }
    }

  }

  closeTab(index: number): void {
    const items = this.nomineeForm.get('items') as UntypedFormArray;
    items.removeAt(index);
    if (this.activeTab === index && items.length > 0) {
      this.activeTab = index === 0 ? 0 : index - 1; // Set to previous tab
    }
  }
  /**
   * Switch to nominee details add OR Skip it
   */
  switchToNominee() {
    this.isNomineeAvailable = !this.isNomineeAvailable;
    if (this.isNomineeAvailable) {
      this.countNominee = 1;
      this.setForm();
      if (this.verifiedSteps?.isNominatedVerified && !this.verifiedSteps?.isNomineeSkiped) {
        this.getNominee();
      }
    }
  }

  /**
   * Initialize Form
   */
  setForm() {
    this.nomineeForm = this.fb.group({
      items: this.fb.array([this.createItem()])
    });
    this.items = this.nomineeForm.get('items') as UntypedFormArray;
    this.isLoading = false;
    // this.items.push(this.createNewItem(0));
    // this.items.push(this.createNewItem(0));
  }


  /**
  * Create UntypedFormGroup in UntypedFormArray
  */
  createItem(percentage: any = 100): UntypedFormGroup {
    return this.fb.group({
      // prefix_name: new UntypedFormControl('', [ValidationService.required]),
      percentage: new UntypedFormControl(`100`),
      nominee_full_name: new UntypedFormControl('', Validators.compose([ValidationService.onlyRequired, ValidationService.onlyAlphabeticAllow])),
      // nominee_last_name: new UntypedFormControl('', [ValidationService.onlyRequired]),
      // pan_number: new UntypedFormControl('', Validators.compose([Validators.required])),
      needed: new UntypedFormControl(true),
      // nominee_identity_type: new UntypedFormControl('', [ValidationService.required]),
      // nominee_identity_number: new UntypedFormControl('', [ValidationService.required]),
      nominee_relation: new UntypedFormControl('', [ValidationService.required]),
      other_nominee_relation: new UntypedFormControl(''),
      nominee_dob: new UntypedFormControl('', Validators.compose([ValidationService.required, ValidationService.dobValidator, ValidationService.dobFutureValidator])),
      nominee_mobile_number: new UntypedFormControl('', Validators.compose([ValidationService.required, Validators.maxLength(10), ValidationService.mobileNumberValidator, ValidationService.mobileNumberFIXSTARTDigitValidator])),
      nominee_email: new UntypedFormControl('', Validators.compose([Validators.required, ValidationService.emailNomineeValidator])),
      nominee_proof_type: new UntypedFormControl('', Validators.compose([Validators.required])),
      nominee_proof_number: environment?.isNomineeProofNumberRequired ? new UntypedFormControl('', Validators.compose([Validators.required])) : new UntypedFormControl(''),
      nominee_proof_required: new UntypedFormControl(false),
      // pan_number: new UntypedFormControl('', Validators.compose([Validators.required])),
      is_same_as_user: new UntypedFormControl(true),
      address_line1: new UntypedFormControl(''),
      address_line2: new UntypedFormControl(''),
      address_line3: new UntypedFormControl(''),
      pin_code: new UntypedFormControl('', [Validators.maxLength(6)]),
      // city: ['', [Validators.required, this.singleStringValidator]],
      city: new UntypedFormControl('', Validators.compose([this.singleStringValidator])),
      state: new UntypedFormControl(''),
      country: new UntypedFormControl('INDIA'),
      isGuardian: new UntypedFormControl(null),
      guardian_first_name: new UntypedFormControl(''),
      guardian_last_name: new UntypedFormControl(''),
      guardian_dob: new UntypedFormControl(''),
      // guardian_pan_number: new UntypedFormControl(''),
      guardian_proof_type: new UntypedFormControl(''),
      guardian_proof_number: new UntypedFormControl(''),
      guardian_proof_required: new UntypedFormControl(false),
      guardian_nominee_relation: new UntypedFormControl(''),
      guardian_mobile_number: new UntypedFormControl(''),
      guardian_email: new UntypedFormControl(''),
      guardian_address_same_applicant: new UntypedFormControl(true),
      guardian_address_line1: new UntypedFormControl(''),
      guardian_address_line2: new UntypedFormControl(''),
      guardian_address_line3: new UntypedFormControl(''),
      guardian_pin_code: new UntypedFormControl('', [Validators.maxLength(10)]),
      guardian_country: new UntypedFormControl('INDIA'),
    });
  }

  get nomineeForms() {
    return this.items.get('items') as UntypedFormArray
  }
  @ViewChild('tabset') tabset: any;

  addNewNominee() {
    this.items.push(this.createNewItem(0));
    this.makeValidation();
    setTimeout(() => {
      // this.tabset.select(`tab${this.items.length - 1}`);
      this.active = Number(this.items.length) - 1;
      // console.log('test', this.active);
    }, 500);
  }

  /**
   * Create UntypedFormGroup in UntypedFormArray
   */
  createNewItem(percentage: any = 100): UntypedFormGroup {
    return this.fb.group({
      // prefix_name: new UntypedFormControl('', [ValidationService.required]),
      percentage: new UntypedFormControl('', [ValidationService.required]),
      nominee_full_name: new UntypedFormControl('', [ValidationService.onlyRequired, ValidationService.onlyAlphabeticAllow]),
      // nominee_last_name: new UntypedFormControl('', [ValidationService.onlyRequired]),
      // pan_number: new UntypedFormControl('', Validators.compose([Validators.maxLength(10), ValidationService.panValidator])),
      needed: new UntypedFormControl(true),
      nominee_relation: new UntypedFormControl('', [ValidationService.required]),
      other_nominee_relation: new UntypedFormControl(''),
      nominee_dob: new UntypedFormControl('', Validators.compose([ValidationService.required, ValidationService.dobValidator])),
      nominee_mobile_number: new UntypedFormControl('', Validators.compose([ValidationService.required, Validators.maxLength(10), ValidationService.mobileNumberValidator, ValidationService.mobileNumberFIXSTARTDigitValidator])),
      nominee_email: new UntypedFormControl('', Validators.compose([Validators.required, ValidationService.emailNomineeValidator])),
      nominee_proof_type: new UntypedFormControl('', Validators.compose([Validators.required])),
      nominee_proof_number: environment?.isNomineeProofNumberRequired ? new UntypedFormControl('', Validators.compose([Validators.required])) : new UntypedFormControl(''),
      nominee_proof_required: new UntypedFormControl(false),
      is_same_as_user: new UntypedFormControl(true),
      address_line1: new UntypedFormControl(''),
      address_line2: new UntypedFormControl(''),
      address_line3: new UntypedFormControl(''),
      pin_code: new UntypedFormControl('', [Validators.maxLength(10)]),
      // city: ['', [Validators.required, this.singleStringValidator]],
      city: new UntypedFormControl('', Validators.compose([this.singleStringValidator])),
      state: new UntypedFormControl(''),
      country: new UntypedFormControl('INDIA'),
      isGuardian: new UntypedFormControl(null),
      guardian_first_name: new UntypedFormControl(''),
      guardian_last_name: new UntypedFormControl(''),
      guardian_dob: new UntypedFormControl(''),
      // guardian_pan_number: new UntypedFormControl(''),
      guardian_proof_type: new UntypedFormControl(''),
      guardian_proof_number: new UntypedFormControl(''),
      guardian_proof_required: new UntypedFormControl(false),
      guardian_nominee_relation: new UntypedFormControl(''),
      guardian_mobile_number: new UntypedFormControl(''),
      guardian_email: new UntypedFormControl(''),
      guardian_address_same_applicant: new UntypedFormControl(true),
      guardian_address_line1: new UntypedFormControl(''),
      guardian_address_line2: new UntypedFormControl(''),
      guardian_address_line3: new UntypedFormControl(''),
      guardian_pin_code: new UntypedFormControl('', [Validators.maxLength(10)]),
      guardian_country: new UntypedFormControl('INDIA'),
    });

  }

  removeNewNominee(ind: any) {
    // this.removeNewNominee
    this.modalService.open(this.deleteNominee, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => {
      if (result === 'ok') {
        this.items = this.nomineeForm.get('items') as UntypedFormArray;
        this.items.removeAt(ind);
        // this.tabset.select(`tab${this.items.length - 1}`);
        this.makeValidation();
        setTimeout(() => {
          this.active = Number(this.items.length) - 1;
        }, 700);
      }
    });

    // const index = this.items.indexOf(ind);
    // if (index > -1) {
    //   this.items.splice(index, 1);
    // }
    // this.items.push(this.createNewItem(0));
    // setTimeout(() => {

    // }, 500);
  }

  changeNomineeRelation($event, index: any) {

    const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
    nomineeArrayItems.controls.forEach((formItem, j) => {

      // console.log('this.nomineeForm?.value?.items[index]?.nominee_relation', this.nomineeForm?.value?.items[index]?.nominee_relation);
      if (index === j) {
        if (this.nomineeForm?.value?.items[index]?.nominee_relation === 'Others') {
          formItem.get('other_nominee_relation').setValidators([ValidationService.onlyRequired, ValidationService.onlyAlphabeticAllow]);
          formItem.get('other_nominee_relation').updateValueAndValidity();
        } else if (this.nomineeForm?.value?.items[index]?.nominee_relation !== 'Others') {
          formItem.get('other_nominee_relation').clearValidators();
          formItem.get('other_nominee_relation').updateValueAndValidity();
        }
      }
    })
  }

  /**
   * While change nominee proof
   * @param $event 
   * @param index 
   */
  maskProof = '';
  changeNomineeProof($event, index: any) {
    console.log('$event.target.value', $event.target.value);
    console.log('this.nomineeForm?.value?.items[index]?.nominee_proof_type', this.nomineeForm?.value?.items[index]?.nominee_proof_type);
    if (environment?.isNomineeProofNumberRequired) {
      const isRequired = this.getValueCheck.transform(this.commonConfigFlow?.nomineeProof, $event.target.value);
      const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
      nomineeArrayItems.controls.forEach((formItem, j) => {
        if (index === j && isRequired) {
          formItem.get('nominee_proof_required').setValue(true);
          formItem.get('nominee_proof_number').setValue('');
          if (this.nomineeForm.value.items[index].nominee_proof_type === '02') {
            this.maskProof = "SSSSS9999S";
            formItem.get('nominee_proof_number').setValidators([Validators.required, ValidationService.panValidator]);
          } else if (this.nomineeForm.value.items[index].nominee_proof_type === '03') {
            this.maskProof = "9999";
            formItem.get('nominee_proof_number').setValidators([Validators.required, ValidationService.fourDigit]);
          } else if (this.nomineeForm.value.items[index].nominee_proof_type === '06') {
            // this.maskProof = "999999999999";
            this.maskProof = "999999999999";
            formItem.get('nominee_proof_number').setValidators([Validators.required, ValidationService.drivingLicence]);
          } else if (this.nomineeForm.value.items[index].nominee_proof_type === '07') {
            this.maskProof = "999999999999";
            formItem.get('nominee_proof_number').setValidators([Validators.required, ValidationService.isValidPassportNo]);
          } else {
            this.maskProof = "99999999";
            formItem.get('nominee_proof_number').setValidators([Validators.required]);
          }
          formItem.get('nominee_proof_number').updateValueAndValidity();
        } else if (index === j && !isRequired) {
          formItem.get('nominee_proof_required').setValue(false);
          formItem.get('nominee_proof_number').setValue('');
          formItem.get('nominee_proof_number').clearValidators();
          formItem.get('nominee_proof_number').updateValueAndValidity();
        }
      });
    }
  }

  /**
   * While change guadian proof of nominee
   * @param $event 
   * @param index 
   */
  maskGuardianProof = '';
  changeGuardianProof($event, index: any) {
    if (environment?.isNomineeProofNumberRequired) {
      const isRequired = this.getValueCheck.transform(this.commonConfigFlow?.nomineeProof, $event.target.value);
      const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
      nomineeArrayItems.controls.forEach((formItem, j) => {
        if (index === j && isRequired) {
          formItem.get('guardian_proof_required').setValue(true);
          formItem.get('guardian_proof_number').setValue('');
          if (this.nomineeForm.value.items[index].guardian_proof_type === '02') {
            this.maskGuardianProof = "SSSSS9999S";
            formItem.get('guardian_proof_number').setValidators([Validators.required, ValidationService.panValidator]);
          } else if (this.nomineeForm.value.items[index].guardian_proof_type === '03') {
            this.maskGuardianProof = "9999";
            formItem.get('guardian_proof_number').setValidators([Validators.required, ValidationService.fourDigit]);
          } else if (this.nomineeForm.value.items[index].guardian_proof_type === '06') {
            this.maskGuardianProof = "999999999999";
            formItem.get('guardian_proof_number').setValidators([Validators.required, ValidationService.drivingLicence]);
          } else if (this.nomineeForm.value.items[index].guardian_proof_type === '07') {
            this.maskGuardianProof = "999999999999";
            formItem.get('guardian_proof_number').setValidators([Validators.required, ValidationService.isValidPassportNo]);
          } else {
            this.maskGuardianProof = "99999999";
            formItem.get('guardian_proof_number').setValidators([Validators.required]);
          }
          formItem.get('guardian_proof_number').updateValueAndValidity();
        } else if (index === j && !isRequired) {
          formItem.get('guardian_proof_required').setValue(false);
          formItem.get('guardian_proof_number').setValue('');
          formItem.get('guardian_proof_number').clearValidators();
          formItem.get('guardian_proof_number').updateValueAndValidity();
        }
      });
    }
  }

  /**
   * Check for same as permenent
   */
  checkForSameAsPermenent(event, index) {
    const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
    if (event.target.checked) {
      this.addAddress = false;
      const arrayFields = ['address_line1', 'address_line2', 'address_line3', 'pin_code', 'country', 'state', 'city'];
      nomineeArrayItems.controls.forEach((formItem, j) => {
        if (index === j) {
          arrayFields.map((item) => {
            formItem.get(item).clearValidators();
            formItem.get(item).updateValueAndValidity();
          });
        }
      });
    } else {
      this.addAddress = true;
      const arrayFields = ['address_line1', 'address_line2', 'address_line3'];
      nomineeArrayItems.controls.forEach((formItem, j) => {
        if (index === j) {
          arrayFields.map((item) => {
            formItem.get(item).setValidators([Validators.required]);
            formItem.get(item).updateValueAndValidity();
          });
          formItem.get('pin_code').setValidators([Validators.required, ValidationService.pincodeValidator]);
          formItem.get('pin_code').updateValueAndValidity();
          formItem.get('country').setValue('INDIA');
          formItem.get('country').setValidators([Validators.required]);
          formItem.get('country').updateValueAndValidity();
        }
      });
    }

  }

  /**
   * Checking for guardian address 
   * @param event 
   * @param index 
   */
  checkForSameAsPermenentForGuardian(event, index) {
    const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
    if (event.target.checked) {
      const arrayFields = ['guardian_address_line1', 'guardian_address_line2', 'guardian_address_line3', 'guardian_pin_code', 'guardian_country'];
      nomineeArrayItems.controls.forEach((formItem, j) => {
        if (index === j) {
          arrayFields.map((item) => {
            formItem.get(item).clearValidators();
            formItem.get(item).updateValueAndValidity();
          });
        }
      });
    } else {
      const arrayFields = ['guardian_address_line1', 'guardian_address_line2', 'guardian_address_line3'];
      nomineeArrayItems.controls.forEach((formItem, j) => {
        if (index === j) {
          arrayFields.map((item) => {
            formItem.get(item).setValidators([Validators.required]);
            formItem.get(item).updateValueAndValidity();
          });
          formItem.get('guardian_pin_code').setValidators([Validators.required, ValidationService.pincodeValidator]);
          formItem.get('guardian_pin_code').updateValueAndValidity();
          formItem.get('guardian_country').setValue('INDIA');
          formItem.get('guardian_country').setValidators([Validators.required]);
          formItem.get('guardian_country').updateValueAndValidity();
        }
      });
    }
  }


  /**
   * Make Validation while adding new nominee
   * @param index 
   */
  makeValidation(index: any = 0) {
    // console.log('index', index);
    const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
    if (nomineeArrayItems.length === 1) {
      const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
      nomineeArrayItems.at(0).patchValue({
        percentage: '100',
      });
    }
    nomineeArrayItems.controls.forEach((formItem, j) => {
      formItem.get('percentage').setValidators([ValidationService.onlyRequired]);
      formItem.get('percentage').updateValueAndValidity();
    });
    if (index) {
      // console.log('nomineeArrayItems', nomineeArrayItems['value'][index]);
      this.checkAge(nomineeArrayItems['value'][index]['nominee_dob'], index);
    }
    const arrayFields = ['percentage', 'nominee_full_name'];
    nomineeArrayItems.controls.forEach((formItem, j) => {
      // if (index === j && index !== 0 && Number(formItem.value.percentage) !== 0 && j !== 0) {
      arrayFields.map((item, i) => {
        if (nomineeArrayItems.length - 1 === j) {
          // console.log('formItem', formItem.get('nominee_dob').value);
          // if (item === 'pan_number') {
          //   formItem.get(item).setValidators(Validators.compose([Validators.maxLength(10), ValidationService.panValidator]));
          //   formItem.get(item).updateValueAndValidity();
          // } else
          if (item === 'percentage') {
            formItem.get(item).setValidators(Validators.compose([ValidationService.required]));
            formItem.get(item).updateValueAndValidity();
          } else {
            formItem.get(item).setValidators([Validators.required]);
            formItem.get(item).updateValueAndValidity();
          }
        }
      });
      // } else if (index === j && index !== 0 && Number(formItem.value.percentage) === 0 && j !== 0) {
      //   arrayFields.map((item) => {
      //     formItem.get(item).clearValidators();
      //     formItem.get(item).updateValueAndValidity();
      //   });
      // }
    });
  }

  /**
   * add item dynamically
   */
  addItem(): void {
    if (this.countNominee < 3) {
      this.countNominee++;
      this.items = this.nomineeForm.get('items') as UntypedFormArray;
      this.items.push(this.createItem());
    } else {
      this.global.errorToastr(this.translate.instant('Add_Max_Nominee'));
    }
  }

  /**
   * Remove nominee using index
   * @param index 
   */
  RemoveItem(index: number) {
    if (this.countNominee > 1) {
      this.countNominee--;
      this.items.removeAt(index);
    }
  }

  /**
   * get nominee details
   */
  getNominee() {
    this.dashboardService.getNominee().subscribe((res) => {
      if (res.success) {
        if (res.result.nomineeinfo.length > 1) {
          res.result.nomineeinfo.map((item, i) => {
            if (i > 0) {
              this.items.push(this.createNewItem(0));
            }
          });
        }
        setTimeout(() => {
          const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
          if (!res.result.isNomineeSkiped) {
            this.getNomineeInfoData = res.result.nomineeinfo;
            res.result.nomineeinfo.map((item, i) => {
              //  const fullName = `${item.nominee_first_name} ${item.nominee_last_name}`;
              const nominee_full_name = (item?.nominee_full_name) ? item?.nominee_full_name : (item?.nominee_first_name + " " + item?.nominee_last_name);
              this.checkPincodeofNominee(res?.result?.nomineeinfo[i].pin_code, false, i); // get city, state list
              // this.singleStringValidator(res?.result?.nomineeinfo[i].city)
              nomineeArrayItems.at(i).patchValue({
                percentage: item.percentage,
                nominee_full_name: nominee_full_name,
                // nominee_last_name: item.nominee_last_name,
                // pan_number: item.pan_number,
                nominee_proof_type: item?.nominee_proof_type,
                nominee_proof_number: item?.nominee_proof_number ? item?.nominee_proof_number : "",
                nominee_proof_required: item?.nominee_proof_required,
                needed: item.needed,
                nominee_relation: item.nominee_relation,
                other_nominee_relation: item?.other_nominee_relation,
                nominee_dob: item.nominee_dob,
                nominee_mobile_number: item.nominee_mobile_number,
                nominee_email: item.nominee_email,
                is_same_as_user: item.is_same_as_user,
                address_line1: item.address_line1,
                state: item.state,
                city: item.city,
                address_line2: item.address_line2,
                address_line3: item.address_line3,
                pin_code: item.pin_code,
                country: item.country,
                isGuardian: item.isGuardian,
                guardian_first_name: item.guardian_first_name,
                guardian_last_name: item.guardian_last_name,
                guardian_dob: item.guardian_dob,
                // guardian_pan_number: item.guardian_pan_number,
                guardian_proof_type: item?.guardian_proof_type,
                guardian_proof_number: item?.guardian_proof_number ? item?.guardian_proof_number : "",
                guardian_proof_required: item?.guardian_proof_required,

                guardian_nominee_relation: item.guardian_nominee_relation,
                guardian_mobile_number: item.guardian_mobile_number,
                guardian_email: item.guardian_email,
                guardian_address_same_applicant: item.guardian_address_same_applicant,
                guardian_address_line1: item.guardian_address_line1,
                guardian_address_line2: item.guardian_address_line2,
                guardian_address_line3: item.guardian_address_line3,
                guardian_pin_code: item.guardian_pin_code,
                guardian_country: item.guardian_country
              });
              // nomineeArrayItems.at(i).patchValue({nominee_proof_required: item?.nominee_proof_required});
              if (environment?.isNomineeProofNumberRequired) {
                this.changeNomineeProofAsPerGetData(item?.nominee_proof_required, i);
                this.changeGuardianNomineeProofAsPerGetData(item?.guardian_proof_required, i);
              }
              // }
            });
          }
        }, 500);
      } else {
        this.global.errorToastr(res.message);
      }
    });
  }

  /**
   * While change nominee proof
   * @param $event 
   * @param index 
   */
  changeNomineeProofAsPerGetData(nominee_proof_required, index: any) {
    // console.log('getNomineeInfoData', this.getNomineeInfoData[index].nominee_proof_number);
    const isRequired = nominee_proof_required;
    const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
    nomineeArrayItems.controls.forEach((formItem, j) => {
      if (index === j && isRequired) {
        formItem.get('nominee_proof_required').setValue(true);
        formItem.get('nominee_proof_number').setValidators([Validators.required]);
        formItem.get('nominee_proof_number').updateValueAndValidity();
      } else if (index === j && !isRequired) {
        formItem.get('nominee_proof_required').setValue(false);
        formItem.get('nominee_proof_number').setValue('');
        formItem.get('nominee_proof_number').clearValidators();
        formItem.get('nominee_proof_number').updateValueAndValidity();
      }
    });
  }

  /**
   * While change nominee proof
   * @param $event 
   * @param index 
   */
  changeGuardianNomineeProofAsPerGetData(guardian_proof_required, index: any) {
    // console.log('getNomineeInfoData', this.getNomineeInfoData[index].nominee_proof_number);
    const isRequired = guardian_proof_required;
    const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
    nomineeArrayItems.controls.forEach((formItem, j) => {
      if (index === j && isRequired) {
        formItem.get('guardian_proof_required').setValue(true);
        // formItem.get('guardian_proof_number').setValue('');
        formItem.get('guardian_proof_number').setValidators([Validators.required]);
        formItem.get('guardian_proof_number').updateValueAndValidity();
      } else if (index === j && !isRequired) {
        formItem.get('guardian_proof_required').setValue(false);
        formItem.get('guardian_proof_number').setValue('');
        formItem.get('guardian_proof_number').clearValidators();
        formItem.get('guardian_proof_number').updateValueAndValidity();
      }
    });
  }

  model;
  iosCheckAge($event: any, index: any) {
    console.log('$event', $event);
    return;
  }
  /**
   * Check Age
   * @returns 
   */
  checkAge($event: any, index: any) {
    // alert(`working-${$event?.length}****${$event}`);

    if ($event && $event.length > 9) {
      let date = $event.split('/');
      /************************************************/
      const dob = new Date(`${parseInt(date[1], 10)}/${parseInt(date[0], 10)}/${parseInt(date[2], 10)}`)
      const month_diff = Date.now() - dob.getTime();
      const age_dt = new Date(month_diff);
      const year = age_dt.getUTCFullYear();

      //now calculate the age of the user
      const calculatedAge = Math.abs(year - 1970);
      /**************************************************/
      // let date1 = new Date(`${parseInt(date[2], 10)}/${parseInt(date[1], 10)}/${parseInt(date[0], 10)}`);
      // let date2 = new Date();
      // let Difference_In_Time =
      //   date2.getTime() - date1.getTime();
      // let Difference_In_Days =
      //   Math.round
      //     (Difference_In_Time / (1000 * 3600 * 24));

      // console.log
      //   ("Total number of days between dates:\n" +
      //     date1.toDateString() + " and " +
      //     date2.toDateString() +
      //     " is: " + Difference_In_Days + " days");
      /****************************************************/
      if (calculatedAge < 18) {
        const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;

        nomineeArrayItems.at(index).patchValue({
          isGuardian: true,
          guardian_address_same_applicant: true,
        });
        const arrayFields = ['guardian_nominee_relation', 'guardian_first_name', 'guardian_last_name', 'guardian_dob', 'guardian_mobile_number', 'guardian_email', 'guardian_proof_type', 'guardian_proof_number', 'guardian_proof_required', 'guardian_address_same_applicant'];
        nomineeArrayItems.controls.forEach((formItem, j) => {
          if (index === j) {
            arrayFields.map((item) => {
              // if (item === 'guardian_pan_number') {
              //   formItem.get(item).setValidators(Validators.compose([ValidationService.required, Validators.maxLength(10), ValidationService.panValidator]));
              //   formItem.get(item).updateValueAndValidity();
              // } else 
              if (item === 'guardian_dob') {
                formItem.get(item).setValidators(Validators.compose([ValidationService.required, ValidationService.dobValidator, ValidationService.dobFutureValidator, ValidationService.AgeValidator]));
                formItem.get(item).updateValueAndValidity();
              } else if (item === 'guardian_email') {
                formItem.get(item).setValidators(Validators.compose([Validators.required, ValidationService.emailNomineeValidator]));
                formItem.get(item).updateValueAndValidity();
              } else if (item === 'guardian_mobile_number') {
                formItem.get(item).setValidators(Validators.compose([ValidationService.required, Validators.maxLength(10), ValidationService.mobileNumberValidator, ValidationService.mobileNumberFIXSTARTDigitValidator]));
                formItem.get(item).updateValueAndValidity();
              } else if (item === 'guardian_first_name' || item === 'guardian_last_name') {
                formItem.get(item).setValidators(Validators.compose([ValidationService.required, ValidationService.onlyAlphabeticAllow]));
                formItem.get(item).updateValueAndValidity();
              } else if (item === 'guardian_proof_number' && !environment?.isNomineeProofNumberRequired) {
                formItem.get(item).clearValidators();
                formItem.get(item).updateValueAndValidity();
              } else {
                formItem.get(item).setValidators(Validators.required);
                formItem.get(item).updateValueAndValidity();
              }
            });
            // formItem.get('pan_number').clearValidators();
            // formItem.get('pan_number').updateValueAndValidity();
          }
        });
      } else {
        const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;
        nomineeArrayItems.at(index).patchValue({
          isGuardian: false,
        });
        const arrayFields = ['guardian_nominee_relation', 'guardian_first_name', 'guardian_last_name', 'guardian_dob', 'guardian_mobile_number', 'guardian_email', 'guardian_proof_type', 'guardian_proof_number', 'guardian_proof_required', 'guardian_address_same_applicant'];
        nomineeArrayItems.controls.forEach((formItem, j) => {
          if (index === j) {
            arrayFields.map((item) => {
              formItem.get(item).clearValidators();
              formItem.get(item).updateValueAndValidity();
            });
            // formItem.get('pan_number').setValidators(Validators.required);
            // formItem.get('pan_number').updateValueAndValidity();
          }
        });

      }
    }
  }

  /**
   * save nominee details
   */
  onSubmit() {
    this.percentageError = '';
    const objParams = { isNomineeSkiped: true };
    if (this.isNomineeAvailable) {
      this.nomineeForm.markAllAsTouched();
      if (this.nomineeForm.invalid) {
        this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
        return;
      }
      const nomineeData = this.nomineeForm.value;
      const sum = nomineeData.items.reduce((accumulator, current) => accumulator + Number(current.percentage), 0);

      if (Number(sum) !== 100) {
        this.percentageError = this.translate.instant('percentage_must_be_hundred'); return;
      }
      objParams['isNomineeSkiped'] = false;
      nomineeData.items.map((item) => {
        if (!environment?.isNomineeProofNumberRequired) {
          item.nominee_proof_number = "";
        }
        if (!item.isGuardian) {
          const arrayFields = ['guardian_nominee_relation', 'guardian_first_name', 'guardian_last_name', 'guardian_dob', 'guardian_mobile_number', 'guardian_email', 'guardian_address_same_applicant', 'guardian_address_line1', 'guardian_address_line2', 'guardian_address_line3', 'guardian_country', 'guardian_pin_code'];
          arrayFields.map((guardItem) => {
            delete item[guardItem];
          });
        }
        if (item.isGuardian && !environment?.isNomineeProofNumberRequired) {
          item.guardian_proof_number = "";

        }

      });

      objParams['nomineeData'] = nomineeData.items;

    }
    this.dashboardService.saveNomineeDetails(objParams).subscribe((res: any) => {
      if (res.success) {
        this.global.logEventUserExperior("Submitted nominee details");
        this.global.successToastr(res.message);
        this.verifiedSteps['isNominatedVerified'] = true;
        this.verifiedSteps['isNomineeSkiped'] = objParams['isNomineeSkiped'];
        this.sharedVarService.setStepsInfo(this.verifiedSteps);
        this.dashboardService.getStepsInfo().subscribe((res) => {
          if (res.success) {
            this.sharedVarService.setStepsInfo(res.result);
            this.verifiedSteps = res.result;
          }
        });
        this.global.redirectToPage('bank-account-details');
      } else {
        this.global.errorToastr(res.message);
      }
    });
  }

  /**
   * Get State, city list of correspondene
   * @param $event 
   * @param target 
   */
  stateDisabled: boolean;
  checkPincodeofNominee($event, target = true, i) {
    this.stateDisabled = false;
    if (target) {
      if ($event.target.value && $event.target.value.length > 5) {
        const objParam = { pincode: $event.target.value };
        this.dashboardService.getStatesCities(objParam).subscribe((res: any) => {
          if (res.success) {
            if (i === 0) {
              this.nominee1State = [];
              this.nominee1State = res.result.state;
              this.nominee1CityList = [];
              this.nominee1CityList = res.result.city_data;
            }
            if (i === 1) {
              this.nominee2State = [];
              this.nominee2State = res.result.state;
              this.nominee2CityList = [];
              this.nominee2CityList = res.result.city_data;
            }
            if (i === 2) {
              this.nominee3State = [];
              this.nominee3State = res.result.state;
              this.nominee3CityList = [];
              this.nominee3CityList = res.result.city_data;
            }
            setTimeout(() => {
              const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;

              nomineeArrayItems.at(i).patchValue({ city: res.result.city_data, state: res.result.state });
              this.stateDisabled = true;

            }, 500);
          } else {
            this.global.errorToastr(res.message);
          }
        })
      }
    } else {
      if ($event > 5) {
        this.global.globalLoader(true);
        const objParam = { pincode: $event };
        this.dashboardService.getStatesCities(objParam).subscribe((res: any) => {
          if (res.success) {
            if (i === 0) {
              this.global.globalLoader(false);
              this.nominee1CityList = [];
              this.nominee1CityList = res.result.city_data;
              this.nominee1State = []
              this.nominee1State = res.result.state;
              this.stateDisabled = true;
            }
            if (i === 1) {
              this.global.globalLoader(false);
              this.nominee2CityList = [];
              this.nominee2CityList = res.result.city_data;
              this.nominee2State = []
              this.nominee2State = res.result.state;
              this.stateDisabled = true;
            }
            if (i === 2) {
              this.global.globalLoader(false);
              this.nominee3CityList = [];
              this.nominee3CityList = res.result.city_data;
              this.nominee3State = []
              this.nominee3State = res.result.state;
              this.stateDisabled = true;
            }
            setTimeout(() => {
              const nomineeArrayItems = this.nomineeForm.get('items') as UntypedFormArray;

              nomineeArrayItems.at(i).patchValue({ city: res.result.city_data, state: res.result.state });
              this.stateDisabled = true;

            }, 500);

          } else {
            this.global.errorToastr(res.message);
          }
        })
      }
    }
  }
  /** to select single element from cities array  as string*/
  singleStringValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (value === null || value === undefined) {
      return null; // Allow null or undefined values
    }
    if (typeof value === 'string') {
      return null; // It's a single string value
    }
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string') {
      return null; // It's an array with a single string value
    }
    return { 'invalidString': { value: value } };
  }


}
