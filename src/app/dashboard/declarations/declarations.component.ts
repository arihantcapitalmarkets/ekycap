import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { ValidationService } from 'src/app/services/validation.service';
import { environment } from 'src/environments/environment';
import { DashboardService } from '../dashboard.service';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { ControlMessagesComponent } from "../../shared/control-messages/control-messages.component";
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-declarations',
  templateUrl: './declarations.component.html',
  styleUrls: ['./declarations.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, ControlMessagesComponent, NgbModule, QRCodeModule]
})
export class DeclarationsComponent implements OnInit, OnDestroy {
  @Output() restartPopUpEvent = new EventEmitter<any>();
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;
  declarations_content: any;
  termsConditionUrl = `${environment.termsConditionUrl}`;
  @ViewChild('bankMismatch') bankMismatch: any;
  @ViewChild('paymentSuccess') paymentSuccess: any;
  @ViewChild('paymentFailed') paymentFailed: any;
  @ViewChild('paymentPopup') paymentPopup: any;
  private modalRef: NgbModalRef;
  bsdaPDFUrl = 'https://ekyc-documents-live.s3.ap-south-1.amazonaws.com/BSDA-SCHEME.pdf';
  deeplink: string = '';
  dataSubscription: Subscription;

  declarationForm: UntypedFormGroup;
  paymentForm: UntypedFormGroup;
  items: UntypedFormArray;
  mainCatItems: UntypedFormArray;
  underTakingItems: UntypedFormArray;
  planItems: UntypedFormArray;
  DDPIConsents: UntypedFormArray;
  AccountStatmentRequired: UntypedFormArray;

  declarationData: any;
  accountDeclarationData = [];
  underTakingData = [];
  getUserDeclarations: any;
  buttonDisabled: boolean;
  plans: any;
  planDescription: any;
  planTitle: any;
  planSelected = true;
  showCommodity: boolean;
  dpSchemeList: any;
  formBuilder: any;
  isLoading: boolean;
  expiry_date: string | number;
  cardNumberLength: any;
  windowHeight: any;

  constructor(
    public fb: UntypedFormBuilder,
    private ref: ChangeDetectorRef,
    private router: Router,
    public global: GlobalService,
    private serviceVarService: SharedVarService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
    @Inject(PLATFORM_ID) private platform: Object,
    private modalService: NgbModal,
  ) { }


  ngOnInit(): void {
    this.onResizeScreen();


    if (!this.global.checkForMFAPP(this.verifiedSteps)) {
      this.navigate('bank-account-details');
    }
    setTimeout(async () => {
      if (this.verifiedSteps && this.verifiedSteps.isApproved) {
        this.global.checkIsApplicationApprove(this.verifiedSteps); return;
      }
    }, 500);
    if (this.contentData?.data) {
      const data = JSON.parse(this.contentData?.data);
      this.declarations_content = data?.declarations_content;
    }
    this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.declarations_content = data?.declarations_content;
      }
    });
    this.setForm();
    if (this.verifiedSteps.mf_app) {
      if (this.verifiedSteps.hasOwnProperty('isNominatedVerified') && !this.verifiedSteps?.isNominatedVerified) {
        setTimeout(() => {
          this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
        }, 500);
      } else {
        if (this.verifiedSteps.hasOwnProperty('isBankAccountVerified') && !this.verifiedSteps?.isBankAccountVerified) {
          setTimeout(() => {
            this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
          }, 500);
        } else {
          setTimeout(() => {
            this.checkBankMismatch();
            this.getBrokerPlans();
            this.getDeclarations();
          }, 500);
        }
      }
    } else {
      this.global.redirectToLastVerifiedToastrGold(this.verifiedSteps);
    }

    // if (this.verifiedSteps) {
    //   if (this.verifiedSteps.isBankAccountVerified) {
    //     this.modalRef = this.modalService.open(this.bankMismatch, { centered: true, backdrop: 'static', keyboard: false });
    //   }
    // }


    this.isLoading = false;

    // document.addEventListener('DOMContentLoaded', () => {
    //   const btn = document.querySelector('#headingDDPI');
    //   // const content = document.querySelector('.content');

    //   btn.addEventListener('click', () => {
    //     btn.classList.toggle('fa-angle-down');
    //     // content.classList.toggle('active');
    //   });
    // });

  }
  @HostListener("window:resize", [])
  private onResize() {
    this.onResizeScreen();
  }
  onResizeScreen() {
    this.windowHeight = window.innerHeight / 2;
    // console.log('window.innerHeight', this.windowHeight);
  }

  checkBankMismatch(): void {
    if (this.verifiedSteps && !this.verifiedSteps?.is_boat_user && !this.verifiedSteps?.isBeta) {
      if (this.verifiedSteps.showBankMisMatchPopup && this.verifiedSteps.isBankAccountVerified) {
        this.modalRef = this.modalService.open(this.bankMismatch, { centered: true, backdrop: 'static', keyboard: false });
      }
    }
  }

  navigate(type: string) {
    this.router.navigate([type]);
    this.global.onActivate();
    this.serviceVarService.setActivePageInfoValue(type);
  }


  getBrokerPlans() {
    this.global.getBrokeragePlanList().subscribe((res: any) => {
      if (res.success) {
        this.plans = res.result;
        if (this.plans.length) {
          this.plans.map((resItems, i) => {
            this.planItems = this.declarationForm?.get('planItems') as UntypedFormArray;
            // this.underTakingItems.push(this.fb.control('', Validators.required));
            // if (this.plans.length === 1) {
            //   setTimeout(() => {
            //     this.planItems.push(this.defaultSelectedPlans(resItems));
            //   }, 1000);
            // } else {
            this.planItems.push(this.createPlans(resItems));
            // }
          });
        }
      } else {
        this.global.errorToastr('Broker plan does not found.')
        this.navigate('nominee-details');
      }
    }, error => {
      this.global.errorToastr('Broker plan does not found.')
      this.navigate('nominee-details');
    });
  }


  getDeclarations() {
    this.dashboardService.getDeclarations().subscribe((res: any) => {
      if (res.success) {
        if (this.verifiedSteps?.showBankMisMatchPopup) { // call this while showBankMisMatchPopup = true
          this.dashboardService.getStepsInfo().subscribe((res) => {
            if (res.success) {
              this.serviceVarService.setStepsInfo(res.result);
              this.verifiedSteps = res.result;
            }
          });
        }

        if (res?.result?.show_commodity) {
          this.showCommodity = true;
        }

        this.accountDeclarationData = res?.result?.account;
        this.planTitle = res?.result?.plan_title;
        this.planDescription = res?.result?.description;
        if (this.accountDeclarationData.length) {
          this.accountDeclarationData.map((resItems, i) => {
            this.mainCatItems = this.declarationForm?.get('mainCatItems') as UntypedFormArray;
            this.mainCatItems.push(this.createAccountDeclaration(resItems));
          });
        }
        this.underTakingData = res?.result?.undertaking;
        if (this.underTakingData?.length) {
          this.underTakingData.map((resItems, i) => {
            this.underTakingItems = this.declarationForm?.get('underTakingItems') as UntypedFormArray;
            // this.underTakingItems.push(this.fb.control('', Validators.required));
            this.underTakingItems.push(this.createUnderTakingDeclaration(resItems));
          });
        }

        if (res?.result?.dpschemes?.length) {
          this.dpSchemeList = res?.result?.dpschemes;
          // console.log('this.dpSchemeList', this.dpSchemeList);
          // this.declarationForm.get('dp_scheme').setValidators([Validators.required]);
          // this.declarationForm.get('dp_scheme').updateValueAndValidity();
        }

        setTimeout(() => {
          if (this.verifiedSteps?.isDeclaration) {
            this.dashboardService.getUserDeclarations().subscribe((res: any) => {
              if (res.success) {
                this.getUserDeclarations = res?.result;
                if (res?.result?.BSECASE) {
                  this.declarationForm.patchValue({ BSECASE: res?.result?.BSECASE });
                }
                if (this.showCommodity) {
                  this.declarationForm.patchValue({ isCommodity: res?.result?.isCommodity });
                }

                if (res?.result?.FutureOptions) {
                  this.declarationForm.patchValue({ FutureOptions: res?.result?.FutureOptions });
                } else {
                  this.declarationForm.patchValue({ FutureOptions: false });
                }

                if (res?.result?.currency) {
                  this.declarationForm.patchValue({ currency: res?.result?.currency });
                } else {
                  this.declarationForm.patchValue({ currency: false });
                }

                if (res?.result?.Mutualfunds) {
                  this.declarationForm.patchValue({ Mutualfunds: res?.result?.Mutualfunds });
                }
                if (res?.result?.NSECASE) {
                  this.declarationForm.patchValue({ NSECASE: res?.result?.NSECASE });
                }
                if (res?.result?.security) {
                  this.declarationForm.patchValue({ security: res?.result?.security });
                }
                this.declarationForm.patchValue({ ddpi: false });
                if (res?.result?.ddpi) {
                  this.declarationForm.patchValue({ ddpi: res?.result?.ddpi });
                  this.onChangeDDPI(res?.result?.ddpi);
                } else {
                  this.onChangeDDPI(false);
                }

                this.declarationForm.patchValue({ MTF: false });
                if (res?.result?.MTF) {
                  this.declarationForm.patchValue({ MTF: res?.result?.MTF });
                }

                this.declarationForm.patchValue({ pep_exposed: false });
                if (res?.result.hasOwnProperty('pep_exposed')) {
                  this.declarationForm.patchValue({ pep_exposed: res?.result?.pep_exposed ? res?.result?.pep_exposed : false });
                }
                this.declarationForm.patchValue({ indian_resident: true });
                if (res?.result.hasOwnProperty('indian_resident')) {
                  this.declarationForm.patchValue({ indian_resident: res?.result?.indian_resident ? res?.result?.indian_resident : false });
                }
                this.declarationForm.patchValue({ ecn: true });
                if (res?.result.hasOwnProperty('ecn')) {
                  this.declarationForm.patchValue({ ecn: res?.result?.ecn ? res?.result?.ecn : false });
                }


                if (res?.result?.trade) {
                  this.declarationForm.patchValue({ BSECASE: res?.result?.trade });
                }
                if (res?.result?.limit_days) {
                  this.declarationForm.patchValue({ limit_days: res?.result?.limit_days });
                }

                if (res?.result?.brokerCode) {
                  this.selectPlans('on', res?.result?.brokerCode);
                } else if (res?.result?.broker_code) {
                  this.selectPlans('on', res?.result?.broker_code);
                }

                if (res?.result?.dp_scheme) {
                  this.declarationForm.patchValue({ dp_scheme: res?.result?.dp_scheme });
                }
                // if (res?.result?.bsda_scheme) {
                //   this.declarationForm.patchValue({ bsda_scheme: res?.result?.bsda_scheme });
                // }


                if (res?.result.mainCatItems) {
                  const mainCatItems = this.declarationForm.get('mainCatItems') as UntypedFormArray;
                  res?.result.mainCatItems.map((item) => {
                    if (item.selected) {
                      mainCatItems.controls.forEach((ctrl: UntypedFormControl) => {
                        if (ctrl.value.id === item.id) {
                          ctrl.patchValue({ selected: item.selected });
                        }
                      });
                    }
                  });
                }

                if (res?.result.underTakingItems) {
                  const underTakingItems = this.declarationForm.get('underTakingItems') as UntypedFormArray;
                  res?.result.underTakingItems.map((item) => {
                    if (item.selected) {
                      underTakingItems.controls.forEach((ctrl: UntypedFormControl) => {
                        if (ctrl.value.id === item.id) {
                          ctrl.patchValue({ selected: item.selected });
                        }
                      });
                    } else {
                      underTakingItems.controls.forEach((ctrl: UntypedFormControl) => {
                        if (ctrl.value.id === item.id) {
                          ctrl.patchValue({ selected: item.selected });
                        }
                      });
                    }
                  })
                }

                if (res?.result.DDPIConsents) {
                  this.patchFormArrayValueDynamically('DDPIConsents', res?.result.DDPIConsents);
                }
                if (res?.result.AccountStatmentRequired) {
                  this.patchFormArrayValueDynamically('AccountStatmentRequired', res?.result.AccountStatmentRequired);
                }

              }
            })
          } else {
            this.selectPlans('on', this.plans[0].broker_code);
          }
        }, 500);
      } else {
        this.global.errorToastr(this.translate.instant('Please_try_again'));
      }
    }, error => {
      this.global.errorToastr(this.translate.instant('Please_try_again'));
    });
  }

  patchFormArrayValueDynamically(formArrayName: string, resultData: any) {
    const fornArrayMapping = this.declarationForm.get(formArrayName) as UntypedFormArray;
    resultData.map((item) => {
      if (item.selected) {
        fornArrayMapping.controls.forEach((ctrl: UntypedFormControl) => {
          if (ctrl.value.id === item.id) {
            ctrl.patchValue({ selected: item.selected });
          }
        });
      } else {
        fornArrayMapping.controls.forEach((ctrl: UntypedFormControl) => {
          if (ctrl.value.id === item.id) {
            ctrl.patchValue({ selected: item.selected });
          }
        });
      }
    })
  }

  get declarationForms() {
    return this.declarationForm.get('mainCatItems') as UntypedFormArray
  }

  get underTakings(): UntypedFormArray {
    return this.declarationForm.get('underTakingItems') as UntypedFormArray;
  }

  get brokerPlans(): UntypedFormArray {
    return this.declarationForm.get('brokerPlans') as UntypedFormArray;
  }

  /**
   * Initialize Form
   */
  setForm() {
    const requiredCheckbox = [true, Validators.required];
    const requiredOnlyCheckbox = [true, ValidationService.onlyCheckboxRequired];
    this.declarationForm = this.fb.group({
      // signupPlan: requiredCheckbox,
      // bsda_scheme: requiredCheckbox,
      trade: requiredCheckbox,
      NSECASE: requiredOnlyCheckbox,
      Mutualfunds: requiredOnlyCheckbox,
      BSECASE: requiredOnlyCheckbox,
      FutureOptions: new UntypedFormControl(false),
      currency: new UntypedFormControl(false),
      security: requiredCheckbox,
      limit_days: new UntypedFormControl('90', [Validators.required]),
      mainCatItems: this.fb.array([]),
      underTakingItems: this.fb.array([]),
      planItems: this.fb.array([]),
      DDPIConsents: this.fb.array([]),
      AccountStatmentRequired: this.fb.array([]),
      isCommodity: new UntypedFormControl(false),
      dp_scheme: new UntypedFormControl(''),
      ddpi: new UntypedFormControl(true),
      MTF: new UntypedFormControl(false),
      pep_exposed: new UntypedFormControl(false),
      indian_resident: new UntypedFormControl(true),
      ecn: new UntypedFormControl(true)
    });
    this.mainCatItems = this.declarationForm?.get('mainCatItems') as UntypedFormArray;
    this.underTakingItems = this.declarationForm?.get('underTakingItems') as UntypedFormArray;
    this.planItems = this.declarationForm?.get('planItems') as UntypedFormArray;
    this.DDPIConsents = this.declarationForm?.get('DDPIConsents') as UntypedFormArray;

    if (this.global?.isDDPIConsentRequired) {
      // setTimeout(() => {
      this.createDDPIConsentsArray();
      this.createAccountStatementRequredArray();
      // }, 1000);
    }
    this.declarationForm.markAllAsTouched();
  }

  // Disable the entire UntypedFormArray
  disableItems(): void {
    this.DDPIConsents = this.declarationForm?.get('DDPIConsents') as UntypedFormArray;
  }
  /**
   * Set selected true
   * @param $event 
   * @param mainCategoryId 
   */
  createDDPIConsentsArray() {
    this.global?.ddpiConsentsArray.map((value, i) => {
      this.DDPIConsents = this.declarationForm?.get('DDPIConsents') as UntypedFormArray;
      let selectedVar = true;
      if (value?.selected) {
        selectedVar = value?.selected;
      }
      let disableVar = false;
      if (value?.is_disable) {
        disableVar = value?.is_disable;
      }
      let labelName = '';
      if (value.name) {
        labelName = value.name
      }
      // this.underTakingItems.push(this.fb.control('', Validators.required));
      const ctrl = this.fb.group({
        is_disable: false,
        is_required: value.is_required,
        selected: selectedVar,
        id: value.id,
        name: value.name,
        description: value?.description,
      });
      this.DDPIConsents.push(ctrl);
    });
  }
  /**
  * Set selected true
  * @param $event 
  * @param mainCategoryId 
  */
  createAccountStatementRequredArray() {
    this.global?.accountStatementRequiredArray.map((value, i) => {
      this.AccountStatmentRequired = this.declarationForm?.get('AccountStatmentRequired') as UntypedFormArray;
      let selectedVar = false;
      if (value?.selected) {
        selectedVar = value?.selected;
      }
      let disableVar = false;
      if (value?.is_disable) {
        disableVar = value?.is_disable;
      }
      let labelName = '';
      if (value.name) {
        labelName = value.name
      }
      // this.underTakingItems.push(this.fb.control('', Validators.required));
      const ctrl = this.fb.group({
        is_disable: disableVar,
        is_required: value.is_required,
        selected: selectedVar,
        id: value.id,
        name: value.name,
        description: value.description,
      });
      this.AccountStatmentRequired.push(ctrl);
    });
    this.setDisabledAccountStatement();
  }
  /**
   * Set selected true
   * @param $event 
   * @param mainCategoryId 
   */
  setDisabledAccountStatement() {
    const parentArray = this.declarationForm.get('AccountStatmentRequired') as UntypedFormArray;
    parentArray.controls.forEach((ctrl: UntypedFormControl) => {
      // console.log('is_disable', ctrl.value);
      if (ctrl.value.is_disable) {
        ctrl.disable();
      }
    });
  }

  /**
   * Create Plans
   * @param value 
   */
  defaultSelectedPlans(value): UntypedFormGroup {
    let selectedVar = false;
    if (value?.selected) {
      selectedVar = value?.selected;
    }
    let labelName = '';
    if (value.name) {
      labelName = value.name
    }
    return this.fb.group({
      selected: value?.broker_code,
      id: value?.broker_code,
      plan_title: value?.plan_title,
      description: value?.description,
      broker_code: value?.broker_code,
    });
  }
  /**
   * Create Plans
   * @param value 
   */
  createPlans(value): UntypedFormGroup {
    let selectedVar = false;
    if (value?.selected) {
      selectedVar = value?.selected;
    }
    let labelName = '';
    if (value.name) {
      labelName = value.name
    }
    return this.fb.group({
      selected: selectedVar,
      id: value?.broker_code,
      plan_title: value?.plan_title,
      description: value?.description,
      broker_code: value?.broker_code,
    });
  }

  /**
   * Create Account Declarations
   * @param value 
   */
  createAccountDeclaration(value): UntypedFormGroup {
    let selectedVar = true;
    if (value?.selected) {
      selectedVar = value?.selected;
    }
    let disableVar = false;
    if (value?.is_disable) {
      disableVar = value?.is_disable;
    }
    let labelName = '';
    if (value.name) {
      labelName = value.name
    }
    return this.fb.group({
      is_disable: disableVar,
      is_required: value.is_required,
      selected: selectedVar,
      id: value.id,
      name: value.name,
      description: value?.description,
    });
  }

  /**
   * Set selected true
   * @param $event 
   * @param mainCategoryId 
   */
  selectCategory($event, mainCategoryId: any) {
    if ($event.target.checked) {
      const parentArray = this.declarationForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (Number(ctrl.value.id) === Number(mainCategoryId)) {
          this.buttonDisabled = false;
          ctrl.patchValue({ selected: true });
        }
      });
    } else {
      const parentArray = this.declarationForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (Number(ctrl.value.id) === Number(mainCategoryId) && ctrl.value.is_required) {
          this.buttonDisabled = true;
          ctrl.patchValue({ selected: false });
        }
      });
    }
  }

  /**
   * Set selected true
   * @param $event 
   * @param mainCategoryId 
   */
  selectUnderTakingCategory($event, mainCategoryId: any) {
    if ($event.target.checked) {
      const parentArray = this.declarationForm.get('underTakingItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (Number(ctrl.value.id) === Number(mainCategoryId)) {
          this.buttonDisabled = false;
          ctrl.patchValue({ selected: true });
        }
      });
    } else {
      const parentArray = this.declarationForm.get('underTakingItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        // parentArray.controls["indian_resident"].setValidators([Validators.required]);
        if (Number(ctrl.value.id) === Number(mainCategoryId) && ctrl.value.is_required) {
          this.buttonDisabled = true;
          ctrl.patchValue({ selected: false });
        }
      });
    }
  }


  /**
   * Set selected true
   * @param $event 
   * @param mainCategoryId 
   */
  selectUnderTakingModulesAccountStatement($event, mainCategoryId: any) {
    const underTakingParentArray = this.declarationForm.get('underTakingItems') as UntypedFormArray;
    if ($event.target.checked) {
      const parentArray = underTakingParentArray.at(5).get('modules') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        ctrl.disable();
        if (Number(ctrl.value.id) === Number(mainCategoryId) && ctrl.value.name === "Monthly") {
          this.buttonDisabled = false;
          ctrl.patchValue({ selected: true });
        }
      });
    } else {
      const parentArray = underTakingParentArray.at(5).get('modules') as UntypedFormArray;
      // const parentArray = this.declarationForm.get('underTakingItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        ctrl.disable();
        // parentArray.controls["indian_resident"].setValidators([Validators.required]);
        if (Number(ctrl.value.id) === Number(mainCategoryId) && ctrl.value.is_required && ctrl.value.name === "Monthly") {
          this.buttonDisabled = true;
          ctrl.patchValue({ selected: false });
        }
      });
    }
  }

  /**
  * Set selected true
  * @param $event 
  * @param mainCategoryId 
  */
  selectDDPIConsent($event, mainCategoryId: any) {
    if ($event.target.checked) {
      const parentArray = this.declarationForm.get('DDPIConsents') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (Number(ctrl.value.id) === Number(mainCategoryId)) {
          this.buttonDisabled = false;
          ctrl.patchValue({ selected: true });
        }
      });
    } else {
      const parentArray = this.declarationForm.get('DDPIConsents') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        // parentArray.controls["indian_resident"].setValidators([Validators.required]);
        if (Number(ctrl.value.id) === Number(mainCategoryId) && ctrl.value.is_required) {
          this.buttonDisabled = true;
          ctrl.patchValue({ selected: false });
        }
      });
    }
  }

  selectAccountStatement($event, mainCategoryId: any) {
    if ($event.target.checked) {
      const parentArray = this.declarationForm.get('AccountStatmentRequired') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (Number(ctrl.value.id) === Number(mainCategoryId)) {
          this.buttonDisabled = false;
          ctrl.patchValue({ selected: true });
        }
      });
    } else {
      const parentArray = this.declarationForm.get('AccountStatmentRequired') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        // parentArray.controls["indian_resident"].setValidators([Validators.required]);
        if (Number(ctrl.value.id) === Number(mainCategoryId) && ctrl.value.is_required) {
          this.buttonDisabled = true;
          ctrl.patchValue({ selected: false });
        }
      });
    }
  }

  /**
   * Create Account Declarations
   * @param value 
   */
  createUnderTakingDeclaration(value): UntypedFormGroup {
    let selectedVar = true;
    if (value?.selected) {
      selectedVar = value?.selected;
    }
    let disableVar = false;
    if (value?.is_disable) {
      disableVar = value?.is_disable;
    }
    let labelName = '';
    if (value.name) {
      labelName = value.name
    }

    if (value.id !== 6) {
      return this.fb.group({
        is_disable: disableVar,
        is_required: value.is_required,
        selected: selectedVar,
        id: value.id,
        name: value.name,
        description: value?.description,
      });
    }
    if (value.id === 6 && value?.array_account_statement) {
      return this.fb.group({
        is_disable: disableVar,
        is_required: value.is_required,
        selected: selectedVar,
        id: value.id,
        name: value.name,
        description: value?.description,
        // modules: value?.array_account_statement?.length ? this.createPermissionsArray(value?.array_account_statement) : ""
      });
    }
  }

  // Create a UntypedFormArray for modules, where each module is represented by a UntypedFormGroup
  createPermissionsArray(): UntypedFormArray {
    const array_account_statement = this.global?.accountStatementRequiredArray;
    const controls = array_account_statement.map(value =>
      this.fb.group({
        is_disable: [true],
        is_required: [value.is_required],
        selected: [value.is_required],
        isSelected: [value.is_required],
        name: [value.name],
        id: [value.id]
      })
    );
    return this.fb.array(controls);
  }


  changePlan(e, brokerCode: any) {
    // console.log(e.target.value);
    // console.log(brokerCode);
    this.selectPlans(e.target.value, brokerCode);
  }
  clickOnPlan(on: string = 'on', brokerCode: any) {
    // console.log(on);
    // console.log(brokerCode);
    this.selectPlans('on', brokerCode);
  }

  // Get the permissions UntypedFormArray for a specific role
  modulesAvailable: boolean;
  permissions(Index: number): UntypedFormArray {
    const cntrlArray = this.underTakingItems.at(Index).get('modules') as UntypedFormArray;
    if (cntrlArray?.controls?.length) {
      this.modulesAvailable = true;
    }
    // console.log('cntrlArray', cntrlArray);
    return cntrlArray;
  }
  // Method to disable the entire UntypedFormGroup
  disableUserDetails(Index: number) {
    const cntrlArray = this.underTakingItems.at(Index).get('modules') as UntypedFormArray;
    cntrlArray.disable();
  }

  /**
   * Set selected true
   * @param $event 
   * @param brokerCode 
   */
  selectPlans(value, brokerCode: any) {
    if (value === 'on') {
      const parentArray = this.declarationForm.get('planItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.broker_code === brokerCode) {
          // console.log('brokerCode', brokerCode);
          this.buttonDisabled = false;
          this.planSelected = true;
          ctrl.patchValue({ selected: ctrl.value.broker_code });
        } else {
          ctrl.patchValue({ selected: false });
        }
      });
    }
    else {
      // console.log('ctrl');
      const parentArray = this.declarationForm.get('planItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.broker_code === brokerCode) {
          this.buttonDisabled = true;
          ctrl.patchValue({ selected: false });
        }
      });
    }
  }

  /**
   * Initialize Form
   */
  setFormValidatePayment() {
    const requiredOnlyCheckbox = [true, ValidationService.onlyCheckboxRequired];
    this.paymentForm = this.fb.group({
      payment_flow: new UntypedFormControl('upi_app', [Validators.required]),
      // cardHolderName: new UntypedFormControl(''),
      // cardNumber: new UntypedFormControl(''),
      // expiry_date: new UntypedFormControl(''),
      // CVV: new UntypedFormControl(''),
      terms_conditions: requiredOnlyCheckbox
    });
  }

  onSubmit() {
    if (this.declarationForm.invalid) {
      this.global.errorToastr(this.translate.instant('PLEASE_FILL_ALL_REQUIRED_FIELDS'));
      return;
    }
    this.planSelected = true;
    const valueOfForm = this.declarationForm.value;
    const planItems = this.planItems?.value?.find(ele => ele.selected);
    if (!planItems) {
      this.planSelected = false;
      window.scroll(0, 0);
      return;
    }
    valueOfForm['broker_code'] = planItems['broker_code'];
    // console.log('valueOfForm', valueOfForm, planItems); return;


    const selectedData = valueOfForm.mainCatItems.find(ele => ele.selected === false);
    const underTaking = valueOfForm.underTakingItems.find(ele => ele.selected === false);
    valueOfForm.mainCatItems.map((innerItem) => {
      delete innerItem.description;
    });
    valueOfForm.underTakingItems.map((innerItem) => {
      delete innerItem.description;
    });
    if (this.declarationForm.value) {
      const underTakeOUTside = [{
        "is_disable": false,
        "is_required": false,
        "selected": this.declarationForm.value?.pep_exposed ? this.declarationForm.value?.pep_exposed : false,
        "id": 1,
        "name": "pep_exposed"
      }, {
        "is_disable": false,
        "is_required": true,
        "selected": this.declarationForm.value?.indian_resident ? this.declarationForm.value?.indian_resident : false,
        "id": 2,
        "name": "indian_resident"
      }, {
        "is_disable": false,
        "is_required": true,
        "selected": this.declarationForm.value?.ecn ? this.declarationForm.value?.ecn : false,
        "id": 7,
        "name": "etrans"
      }];
      valueOfForm.underTakingItems = [...valueOfForm.underTakingItems, ...underTakeOUTside];
    }
    delete valueOfForm.planItems;

    const result = this.dpSchemeList;
    if (result?.length === 1) {
      valueOfForm['dp_scheme'] = result[0].id;
    }

    this.dashboardService.saveDeclarations(valueOfForm).subscribe(async (res: any) => {
      if (res.success) {
        /************************ GA TAG PUSH : START ********************/
        this.global.setPushToGTM({
          'event': 'plan_selected_success',
          'Page_Location': this.router.url.split('?')[0],
          'Page_referrer': this.global?.previousUrl,
          'CTA_text': 'Save & Continue',
          'FormID': 'form id',
          'user_id': `plan_selected_success${Math.random()}`,
          'UTM_source': '',
          'UTM_medium': '',
        });
        /************************ GA TAG PUSH : STOP ********************/
        this.global.logEventUserExperior("Submitted Brokerage plan");
        this.global.logEventUserExperior("Verified declarations");
        // if (!this.verifiedSteps?.isPaymentCompleted && this.verifiedSteps?.isPaymentRequired) {
        //   const temp = await this.checkPayment(); return;
        // }

        this.global.successToastr(res.message);
        this.verifiedSteps['isDeclaration'] = true;
        if (this.verifiedSteps?.isPaymentCompleted && this.verifiedSteps?.isPaymentRequired) {
          this.verifiedSteps['isPaymentCompleted'] = true;
        }
        if (!this.verifiedSteps?.is_boat_user && !this.verifiedSteps?.isBeta) {
          this.serviceVarService.setStepsInfo(this.verifiedSteps);
          this.dashboardService.getStepsInfo().subscribe((res) => {
            if (res.success) {
              this.serviceVarService.setStepsInfo(res.result);
              this.verifiedSteps = res.result;
            }
          });
        }
        if (this.verifiedSteps?.is_boat_user && this.verifiedSteps?.isBeta) {
          if (res?.message) {
            window.location.href = `${environment?.mobileBrokerageReturnUrl}?success=1&message=${res?.message}`;
          } else {
            window.location.href = `${environment?.mobileBrokerageReturnUrl}?success=1&message="Declaration submitted successfully"`;
          }
          return;
        }
        this.global.redirectToPage('signature-photograph');
      } else {
        if (this.verifiedSteps?.is_boat_user && this.verifiedSteps?.isBeta) {
          if (res?.message) {
            window.location.href = `${environment?.mobileBrokerageReturnUrl}?success=0&message=${res?.message}`;
          } else {
            window.location.href = `${environment?.mobileBrokerageReturnUrl}?success=0&message="Declaration update failed"`;
          }
          return;
        }
        if (res?.message) {
          this.global.errorToastr(res.message);
        }
      }
    }, error => {
      if (error.error.message) {
        if (this.verifiedSteps?.is_boat_user && this.verifiedSteps?.isBeta) {
          window.location.href = `${environment?.mobileBrokerageReturnUrl}?success=0&message="Declaration update failed"`;
          return;
        }
        this.global.errorToastr(error.error.message);
      }
    });

  }

  changePaymentType($event) {
    this.paymentForm.get('cardNumber').clearValidators();
    this.paymentForm.get('cardNumber').updateValueAndValidity();
    this.paymentForm.get('cardHolderName').clearValidators();
    this.paymentForm.get('cardHolderName').updateValueAndValidity();
    this.paymentForm.get('expiry_date').clearValidators();
    this.paymentForm.get('expiry_date').updateValueAndValidity();
    this.paymentForm.get('CVV').clearValidators();
    this.paymentForm.get('CVV').updateValueAndValidity();
    if ($event.target.value === 'debit_card') {
      this.paymentForm.get('cardNumber').reset();
      this.paymentForm.get('expiry_date').reset();
      this.paymentForm.get('CVV').reset();
      this.paymentForm.get('cardHolderName').reset();
      this.cardType = '';
      this.paymentForm.get('cardNumber').setValidators([ValidationService.onlyRequired]);
      this.paymentForm.get('cardNumber').updateValueAndValidity();
      this.paymentForm.get('cardHolderName').setValidators([ValidationService.onlyRequired, ValidationService.onlyAlphabeticAllow]);
      this.paymentForm.get('cardHolderName').updateValueAndValidity();
      this.paymentForm.get('expiry_date').setValidators([ValidationService.onlyRequired]);
      this.paymentForm.get('expiry_date').updateValueAndValidity();
      this.paymentForm.get('CVV').setValidators([ValidationService.onlyRequired]);
      this.paymentForm.get('CVV').updateValueAndValidity();
    }
  }

  openPayApp(deeplink: string) {
    window.location.href = deeplink;
  }

  goBackFromQRCode() {
    this.deeplink = "";
    this.dataSubscription && this.dataSubscription.unsubscribe();
    return;
  }

  copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      this.global.successToastr(`${text} copied to clipboard!`);
      // console.log("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      this.global.warningToastr("Failed to copy");
    }
  };

  checkPayment() {
    this.setFormValidatePayment();
    this.paymentForm.markAllAsTouched();
    this.modalRef = this.modalService.open(this.paymentPopup, { centered: true, backdrop: 'static', keyboard: false });
    this.modalRef.result.then((res: any) => {
      // console.log('res', res);
      if (res === "cancel") {
        this.deeplink = "";
        this.dataSubscription && this.dataSubscription.unsubscribe();
      }
    })
  }

  paymentFailedObj: any = "";
  paymentFailedMode(paymentFailedObjData: any) {
    // const paymentFailedObj = {
    //   'fee': this.accountFee,
    //   'paid_via': "UPI",
    //   'time': new Date(),
    //   'Transaction_id': "AP0000111"
    // }
    this.paymentFailedObj = paymentFailedObjData;
    // this.paymentFailedObj = paymentFailedObj;
    this.modalRef = this.modalService.open(this.paymentFailed, { centered: true, backdrop: 'static', keyboard: false });
    this.modalRef.result.then((res: any) => {
      if (res === "done") {
        this.deeplink = "";
        this.dataSubscription && this.dataSubscription.unsubscribe();
        // this.modalRef.dismiss();
        this.modalService.dismissAll();
      }
    });
  }


  paymentSuccessObj: any = "";
  paymentSuccessUPI(paymentSuccessObjData: any) {
    // const paymentSuccessObj = {
    //   'fee': this.accountFee,
    //   'paid_via': "UPI",
    //   'time': new Date(),
    //   'Transaction_id': "AP0000111"
    // }
    this.paymentSuccessObj = paymentSuccessObjData;
    // this.paymentSuccessObj = paymentSuccessObj;
    this.modalRef = this.modalService.open(this.paymentSuccess, { centered: true, backdrop: 'static', keyboard: false });
    this.modalRef.result.then((res: any) => {
      if (res === "done") {
        this.dataSubscription && this.dataSubscription.unsubscribe();
        this.global.redirectToPage('signature-photograph');
      }
    });
  }



  checkOnIntervalPaymentStatus(objParam: any) {
    const numbers = interval(1000 * 10 * 1);
    const takeNumbers = numbers.pipe(take(7));
    this.dataSubscription = takeNumbers.subscribe(x => {
      this.dashboardService.paymentVerificationStausUsingTransactionId(objParam).subscribe((res: any) => {
        if (res.success) {
          this.global.globalLoaderMessage();
          this.verifiedSteps['isDeclaration'] = true;
          if (res?.result?.paymentStatus === "SUCCESS" && this.verifiedSteps?.isPaymentRequired) { // Success Case
            this.verifiedSteps['isPaymentCompleted'] = true;
            this.serviceVarService.setStepsInfo(this.verifiedSteps);
            this.dashboardService.getStepsInfo().subscribe((res) => {
              if (res.success) {
                this.serviceVarService.setStepsInfo(res.result);
                this.verifiedSteps = res.result;
              }
            });
            if (this.verifiedSteps?.is_boat_user && this.verifiedSteps?.isBeta) {
              if (res?.message) {
                window.location.href = `${environment?.mobileBrokerageReturnUrl}?success=1&message=${res?.message}`;
              } else {
                window.location.href = `${environment?.mobileBrokerageReturnUrl}?success=1&message="payment success"`;
              }
              return;
            }
            this.modalRef.dismiss();
            this.modalRef && this.modalRef.dismiss();
            this.isLoading = false;
            this.global.redirectToPage('signature-photograph');
            const paymentSuccessObj = {
              'fee': res?.result?.transactionAmount,
              'paid_via': res?.result?.paymentMode,
              'time': res?.result?.transactionTIme,
              'message': res?.result?.paymentMsg,
              'Transaction_id': res?.result?.transactionID
            }
            this.dataSubscription && this.dataSubscription.unsubscribe();
            this.paymentSuccessUPI(paymentSuccessObj);
            // this.global.redirectToPage('signature-photograph');
          } else if (res?.result?.paymentStatus === "FAIL" && this.verifiedSteps?.isPaymentRequired) { // Failed Case
            const paymentFailedObj = {
              'fee': res?.result?.transactionAmount,
              'paid_via': res?.result?.paymentMode,
              'time': res?.result?.transactionTIme,
              'message': res?.result?.paymentMsg,
              'Transaction_id': res?.result?.transactionID
            }
            this.dataSubscription && this.dataSubscription.unsubscribe();
            this.paymentFailedMode(paymentFailedObj);
          }
          // console.log('result', res.result);
        } else {
          this.global.globalLoaderMessage();
        }
      });
    }, error => {
      this.global.globalLoaderMessage();
      this.dataSubscription && this.dataSubscription.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription && this.dataSubscription.unsubscribe();
  }

  gpayUpiLink: any;
  phonePayUpiLink: any;
  payTMUpiLink: any;
  BHIMUpiLink: any;
  paymentFormSubmitted: boolean;
  submitForPayment() {
    if (this.paymentForm.valid) {
      this.paymentFormSubmitted = false;
      let objParma = {};
      if (this.paymentForm?.value?.payment_flow === 'debit_card') {
        // const cardNumber = this.cardNumber.toString();
        // this.cardNumberLength = cardNumber.length;
        // let expiryDate = this.paymentForm?.value?.expiry_date.toString();
        // expiryDate = expiryDate.match(/.{1,2}/g);
        // expiryDate[1] = `20${expiryDate[1]}`;
        // expiryDate = expiryDate.join('/');
        objParma = {
          payment_type: 'debit_card',
          // cardNumber: this.cardNumber,
          // cardHolderName: this.paymentForm?.value?.cardHolderName,
          // CVV: this.paymentForm?.value?.CVV,
          // expiryDate: expiryDate,
          // cardScheme: this.cardType
        }
      } else if (this.paymentForm?.value?.payment_flow === 'net_banking') {
        objParma = {
          payment_type: 'net_banking'
        }
      } else if (this.paymentForm?.value?.payment_flow === 'upi_app') {
        objParma = {
          payment_type: 'upi_app'
        }
      }
      // this.modalRef.result.then((res: any) => {
      this.dashboardService.makePaymentInIt(objParma).subscribe((res: any) => {
        if (res.success) {
          if (objParma['payment_type'] === 'net_banking' && res?.result?.short_link) {
            window.location.href = res?.result?.short_link;
          } else if (objParma['payment_type'] !== 'net_banking') {
            if (res?.result?.deep_link) {
              // this.modalRef.dismiss();
              this.paymentFormSubmitted = true;
              this.buttonDisabled = false;
              this.isLoading = false;
              this.deeplink = res.result.deep_link;
              if (this.global.isMobileDevice) {
                if (this.global?.mobileType !== 'iOS') {
                  this.openPayApp(this.deeplink);
                }
                let upiLink = res?.result?.deep_link;
                const gpayupiLink = upiLink.replace('upi://pay', 'gpay://upi/pay');
                this.gpayUpiLink = gpayupiLink;

                const phoneupiLink = upiLink.replace('upi://pay', 'phonepe://pay');
                this.phonePayUpiLink = phoneupiLink;

                const paytmupiLink = upiLink.replace('upi://pay', 'paytm://pay');
                this.payTMUpiLink = paytmupiLink;
                // const bhimeupiLink = upiLink.replace('upi://pay', 'bhim://pay');
                // this.BHIMUpiLink = bhimeupiLink;
              }
              const ObjParam = {
                'pg_id': res?.result?.pgId
              }
              this.checkOnIntervalPaymentStatus(ObjParam);
            }
            return;
          }


          //   this.paymentFormSubmitted = true;
          //   if (res?.result?.redirect_url && this.paymentForm?.value?.payment_flow === 'net_banking') {
          //     this.modalRef.dismiss();
          //     this.buttonDisabled = true;
          //     this.isLoading = true;
          //     window.location.href = res.result.redirect_url;
          //   } else if (res?.result?.redirect_url && this.paymentForm?.value?.payment_flow === 'debit_card') {
          //     this.modalRef.dismiss();
          //     this.buttonDisabled = true;
          //     this.isLoading = true;
          //     window.location.href = res.result.redirect_url;
          //   } else if (res?.result?.redirect_url && this.paymentForm?.value?.payment_flow === 'upi_app') {
          //     this.modalRef.dismiss();
          //     this.buttonDisabled = true;
          //     this.isLoading = true;
          //     window.location.href = res.result.redirect_url;
          //   } else {
          //     this.isLoading = false;
          //     this.modalRef.dismiss();
          //   }
          // } else {
          //   this.paymentFormSubmitted = false;
          //   this.modalRef.dismiss();
          //   this.isLoading = false;
          // }
        } else {
          this.modalRef.dismiss();
          this.isLoading = false;
          this.paymentFormSubmitted = false;
          this.global.errorToastr('Server error found'); return;
        }
      }, error => {
        this.modalRef.dismiss();
        this.isLoading = false;
        this.paymentFormSubmitted = false;
        this.global.errorToastr("Server error found from payment gateway.")
      })
    } else {
      this.paymentForm.markAllAsTouched();
      this.global.errorToastr('Please fill all required fields'); return;
    }
  }

  schemePdf: boolean;
  selectedScheme: any;
  itemSelectedId: any
  checkDPScheme($event: any) {
    // console.log('$event', $event)
    if ($event) {
      const result = this.dpSchemeList;
      const res = result.find(element => element.id === $event);
      if (res) {

        this.schemePdf = true;
        this.selectedScheme = res;
        this.itemSelectedId = res.id;
      }
      this.declarationForm.patchValue({ dp_scheme: res.id });
    } else {
      this.schemePdf = false;
      this.selectedScheme = '';
    }
  }

  onChangeMTF(mtf: boolean) {
    this.declarationForm.patchValue({ MTF: mtf });
  }

  onChangeDDPI(ddpi: boolean) {
    this.declarationForm.patchValue({ ddpi: ddpi });
    if (!ddpi) {
      const setControl = {
        is_required: false,
        selected: false,
        is_disable: true
      }
      this.changeValidationAsPerDDPI("delivery_instructions", setControl);
    } else {
      const setControl = {
        is_required: true,
        selected: true,
        is_disable: false
      }
      this.changeValidationAsPerDDPI("delivery_instructions", setControl);
    }
  }

  /**
   * Set selected true
   * @param $event 
   * @param mainCategoryId 
   */
  changeValidationAsPerDDPI(instruction: string = "", setControl: any) {
    // const instruction = "delivery_instructions";
    if (instruction) {
      const parentArray = this.declarationForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.name === instruction) {
          // this.buttonDisabled = false;
          ctrl.value.is_required = setControl?.is_required;
          ctrl.value.selected = setControl?.selected;
          const newFormGroup = this.fb.group({
            is_disable: setControl?.is_disable,
            is_required: setControl?.is_required,
            selected: setControl?.selected,
            id: ctrl.value.id,
            name: ctrl.value.name,
            description: ctrl.value?.description,
          });
          parentArray.setControl(0, newFormGroup);
          newFormGroup.enable();
          if (setControl?.is_disable) {
            newFormGroup.disable();
          } else if (!setControl?.is_disable) {
            newFormGroup.enable();
          }
          newFormGroup.markAsTouched();
          newFormGroup.updateValueAndValidity();
          if (!ctrl.value.is_required && !ctrl.value.selected && this.declarationForm.valid) {
            this.buttonDisabled = false;
          }
          // console.log('newFormGroup', newFormGroup);
        }
      });
    }
  }

  onChangeLimitDays(limitDays: string) {
    this.declarationForm.patchValue({ limit_days: limitDays });
  }

  @ViewChild('futureOptionState') futureOptionState: any;
  onChangeFutureOption($event: any, option: string = 'future_options') {
    if ($event.target.checked) {
      this.modalRef = this.modalService.open(this.futureOptionState, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
      this.modalRef.result.then((res: any) => {
        if (res === 'ok') {
          if (!option || option === 'future_options') {
            this.declarationForm.patchValue({ FutureOptions: true })
          } else if (option === 'currency') {
            this.declarationForm.patchValue({ currency: true })
          } else if (option === 'commodity') {
            this.declarationForm.patchValue({ isCommodity: true })
          }
        } else {
          if (!option || option === 'future_options') {
            this.declarationForm.get('FutureOptions').setValue(false);
          } else if (option === 'currency') {
            this.declarationForm.get('currency').setValue(false);
          } else if (option === 'commodity') {
            this.declarationForm.get('isCommodity').setValue(false);
          }
        }
      })
    } else {
      if (!option || option === 'future_options') {
        this.declarationForm.get('FutureOptions').setValue(false);
      } else if (option === 'currency') {
        this.declarationForm.get('currency').setValue(false);
      } else if (option === 'commodity') {
        this.declarationForm.get('isCommodity').setValue(false);
      }
    }
  }

  onChangeCardExpiry($event) {
    if (this.paymentForm?.value?.expiry_date) {
      this.invalidCardExpiry = false;
      let expiryDate = this.paymentForm?.value?.expiry_date.toString();
      expiryDate = expiryDate.match(/.{1,2}/g);
      expiryDate = expiryDate.join('/');
      // console.log('validateCardExpiry', expiryDate, '----', this.global.validateCardExpiry(expiryDate));
      if (!this.global.validateCardExpiry(expiryDate)) {
        this.invalidCardExpiry = true;
      }
    }
  }
  /**
   * Check debit card
   */
  isValidCard: boolean;
  cardType: string;
  isValidDebitCard: boolean;
  invalidCardExpiry: boolean;
  onChangeDebitCard() {
    this.cardType = '';
    if (this.paymentForm?.value?.payment_flow === 'debit_card') {
      // console.log('test', this.paymentForm?.value?.cardNumber);
      this.cardNumber = this.paymentForm?.value?.cardNumber;
      if (this.cardNumber && this.cardNumber.toString().length > 3) {
        const cardNumber = Number(this.cardNumber);
        if (this.validateDebitCard(cardNumber)) {
          const cardType = this.getCardType(cardNumber);
          this.cardType = cardType;
          // console.log(`The card type is: ${cardType}`);
          // console.log("Valid debit card number");
          this.isValidCard = true;
          this.isValidDebitCard = true;
        } else {
          this.cardType = '';
          this.isValidCard = false;
          // console.log("Invalid debit card number");
          this.isValidDebitCard = false
        }
      }
    } else {
      this.cardNumber = '';
    }
  }
  cardNumber: string | number;
  CVV: string | number;
  validateDebitCard(cardNumber) {
    // console.log('cardNumber', cardNumber);
    const regex = new RegExp(
      '^(?:4[0-9]{12}(?:[0-9]{3})?' +         // Visa
      '|5[1-5][0-9]{14}' +                    // MasterCard
      '|222[1-9][0-9]{12}' +                  // MasterCard 2221-2229
      '|22[3-9][0-9]{13}' +                   // MasterCard 2230-2299
      '|2[3-6][0-9]{14}' +                    // MasterCard 2300-2699
      '|27[01][0-9]{13}' +                    // MasterCard 2700-2719
      '|2720[0-9]{12}' +                      // MasterCard 2720
      '|3[47][0-9]{13}' +                     // American Express
      '|6(?:011|5[0-9]{2})[0-9]{12}' +        // Discover
      '|(?:2131|1800|35\\d{3})\\d{11}' +      // JCB
      '|3(?:0[0-5]|[68][0-9])?[0-9]{11})$'    // Diners Club
    );

    return regex.test(cardNumber);
  }

  getCardType(cardNumber) {
    // Regular expressions for different card types
    const cardPatterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      JCB: /^(?:2131|1800|35\d{3})\d{11}$/,
      dinnerClub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/
    };

    // Check each pattern
    for (const [cardType, pattern] of Object.entries(cardPatterns)) {
      if (pattern.test(cardNumber)) {
        return cardType;
      }
    }

    // If no pattern matches
    return 'unknown';
  }

  @ViewChild('pepExposed') pepExposed: any;
  onChangePEP(value: any) {
    // this.declarationForm.patchValue({ pep_exposed: value });
    if (value) {
      this.modalRef = this.modalService.open(this.pepExposed, { size: 'md', centered: true, backdrop: 'static', keyboard: false });
      this.modalRef.result.then((res: any) => {
        if (res === 'ok') {
          this.declarationForm.get('pep_exposed').setValue(true);
          this.buttonDisabled = true;
        } else {
          this.declarationForm.get('pep_exposed').setValue(false);
          if (!this.declarationForm.value.indian_resident) {
            this.buttonDisabled = true; return;
          }
          this.buttonDisabled = false;
        }
      })
    } else {
      this.declarationForm.get('pep_exposed').setValue(false);
      if (!this.declarationForm.value.indian_resident) {
        this.buttonDisabled = true; return;
      }
      this.buttonDisabled = false;
    }
  }
  @ViewChild('ECNNote') ECNNote: any;
  onChangeECN(value: any) {
    // this.declarationForm.patchValue({ ecn: value });
    if (!value) {
      this.modalRef = this.modalService.open(this.ECNNote, { size: 'md', centered: true, backdrop: 'static', keyboard: false });
      this.modalRef.result.then((res: any) => {
        if (res === 'ok') {
          this.declarationForm.get('ecn').setValue(false);
        } else {
          this.declarationForm.get('ecn').setValue(true);
        }
        // this.buttonDisabled = true;
      })
    } else {
      this.declarationForm.get('ecn').setValue(true);
      // this.buttonDisabled = false;
    }
  }


  @ViewChild('citizenIndian') citizenIndian: any;
  onChangeCitizen(value: boolean) {
    // this.declarationForm.patchValue({ indian_resident: value });
    if (!value) {
      this.modalRef = this.modalService.open(this.citizenIndian, { size: 'md', centered: true, backdrop: 'static', keyboard: false });
      this.modalRef.result.then((res: any) => {
        if (res === 'ok') {
          this.declarationForm.get('indian_resident').setValue(false);
          this.buttonDisabled = true;
        } else {
          this.declarationForm.get('indian_resident').setValue(true);
          if (this.declarationForm.value.pep_exposed) {
            this.buttonDisabled = true; return;
          }
          this.buttonDisabled = false;
        }
      })
    } else {
      this.declarationForm.get('indian_resident').setValue(true);

      if (this.declarationForm.value.pep_exposed) {
        this.buttonDisabled = true; return;
      }
      this.buttonDisabled = false;
    }
  }


}
