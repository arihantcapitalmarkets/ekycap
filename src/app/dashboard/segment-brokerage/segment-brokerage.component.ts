import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormControl, UntypedFormGroup, UntypedFormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';
import { DashboardService } from '../dashboard.service';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { filter } from 'rxjs/operators';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/app/shared/pipes/PipesModule';
import { SharedModule } from 'src/app/shared/shared.module';
import { StepHeaderComponent } from "../../shared/step-header/step-header.component";

@Component({
  selector: 'app-segment-brokerage',
  templateUrl: './segment-brokerage.component.html',
  styleUrls: ['./segment-brokerage.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, SharedModule, TranslateModule, NgbModule, StepHeaderComponent]
})
export class SegmentBrokerageComponent implements OnInit {
  @Input() userInfo: any;
  @Input() verifiedSteps: any;
  @Input() contentData: any;
  @ViewChild('disclaimerModal') disclaimerModal: any;

  mainSegmentType: any;
  subCategoryType = [];
  subCategoryArray: any[] = [];
  displayFunctionalityArray: any[] = [];
  public segmentForm: UntypedFormGroup;
  mainCatItems: UntypedFormArray;
  subCatItems: UntypedFormArray;
  rmCode: any;
  rmCodeArray = [];

  segementTypeArray: UntypedFormArray;
  commonConfigFlow: any;
  constructor(
    public fb: UntypedFormBuilder,
    private router: Router,
    public validate: ValidationService,
    public dashboardService: DashboardService,
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    setTimeout(async () => {
      if (this.verifiedSteps && this.verifiedSteps.isApproved) {
        this.global.checkIsApplicationApprove(this.verifiedSteps); return;
      }
    }, 500);
    this.isAccessibleNav();
  }
  /**
  * validate navigation
  */
  isAccessibleNav() {
    if (this.verifiedSteps.hasOwnProperty('isAddressVerified') && !this.verifiedSteps?.isAddressVerified) {
      setTimeout(() => {
        this.global.redirectToLastVerifiedToastr(this.verifiedSteps);
      }, 500);
      // this.global.errorToastr(this.translate.instant('verify_address_details'));
      // this.global.onActivate();
      // setTimeout(() => {
      //   this.sharedVarService.setActivePageInfoValue('address-details');
      // }, 500);
      // this.router.navigate(['address-details']);
    }
    else {
      this.sharedVarService.getConfigFlowData().subscribe((res: any) => {
        if (res) {
          this.commonConfigFlow = res;
          if (this.commonConfigFlow?.isSegmentSkip) {
            setTimeout(() => {
              this.sharedVarService.setActivePageInfoValue('address-details');
            }, 500);
          }
        } else {
          this.global.setConfigFlow();
        }
      });
      this.getSubCategory();
      this.setForm();
    }
  }

  /**
   * Set Validation Form
   */
  setForm() {
    this.segmentForm = this.fb.group({
      code: '',
      mainCatItems: this.fb.array([]),
      POA: false,
      demat: true,
      isTermsCondition: false
    });
  }

  checkCode() {
    if (this.segmentForm.get('code').value) {
      // console.log('test', this.segmentForm.get('code').value);
      this.rmCode = this.segmentForm.get('code').value;
      const param = { 'code': this.rmCode };
      this.dashboardService.isCodeValid(param).subscribe((res: any) => {
        if (res.success) {
          // this.rmCodeArray.push(this.rmCode);
          this.segmentForm.patchValue({ code: '' });
          // this.rmCode = '';
          this.global.successToastr(res.message);
        } else {
          // this.removeCode(this.rmCode);
          this.segmentForm.patchValue({ code: '' });
          this.rmCode = '';
          if (res?.message) {
            this.global.errorToastr(res?.message);
          }
        }
      });
    }
  }

  removeCode() {
    this.segmentForm.patchValue({ code: '' });
    this.rmCode = '';
    // this.rmCodeArray = this.rmCodeArray.filter((ele => ele !== code));
  }

  addSegmentTypeControls(value): void {
    this.mainCatItems = this.segmentForm.get('mainCatItems') as UntypedFormArray;
    this.mainCatItems.push(this.createSegment(value));
  }

  /**
   * Main Category UntypedFormArray
   * @param value 
   */
  createSegment(value): UntypedFormGroup {
    let selectedVar = false;
    if (value.selected) {
      selectedVar = value.selected;
    }
    let disableVar = false;
    if (value.is_disable) {
      disableVar = value.is_disable;
    }
    return this.fb.group({
      selected: selectedVar,
      is_disable: disableVar,
      category_id: value.category_id,
      category_name: value.category_name,
      category_description: value.category_description,
      sub_cat_items: this.fb.array([])
    });
  }

  /**
 * Sub Category UntypedFormArray (Functionality)
 * @param value 
 */
  createSubSegment(value): UntypedFormGroup {
    let subcateselectedVar = false;
    if (value.subcate_selected) {
      subcateselectedVar = value.subcate_selected;
    }
    return this.fb.group({
      subcate_selected: subcateselectedVar,
      category_id: value.category_id,
      sub_category_id: value.id,
      sub_category_name: value.name,
      plan_id: '',
      plan_description: '',
      plans: this.fb.array([])
    });
  }

  /**
 * Plans UntypedFormArray (Plans)
 * @param value 
 */
  createPlans(value): UntypedFormGroup {
    let planSelectedVar = false;
    if (value.plan_selected) {
      planSelectedVar = value.plan_selected;
    }
    return this.fb.group({
      plan_selected: planSelectedVar,
      plan_id: value.id,
      plan_name: value.name,
      description: value.description
    });
  }

  /**
   * get segement brokerage
   */
  getSegmentBrokerage() {
    this.dashboardService.getSegmentCategory().subscribe((res: any) => {
      if (res.success) {
        this.mainSegmentType = res.result;
      }
    });
  }

  /**
   * get All nested data of category=>sub-category(functionality)=>plans
   */
  getSubCategory() {
    this.global.globalLoader(true);
    this.dashboardService.getPlans().subscribe((res: any) => {
      if (res.success) {

        if (res.result.demat) {
          this.segmentForm.patchValue({
            demat: res.result.demat,
            // isTermsCondition: true
          });
        }
        if (res.result.POA) {
          this.segmentForm.patchValue({
            POA: res.result.POA
          });
        }
        if (res.result.isTermsCondition) {
          this.segmentForm.patchValue({
            isTermsCondition: res.result.isTermsCondition
          });
        }
        if (res.result.rmCode) {
          this.segmentForm.patchValue({
            code: ''
          });
          this.rmCode = res.result.rmCode;
          // this.rmCodeArray.push(res.result.rmCode);
        }

        this.mainSegmentType = res.result.plan_data;
        this.mainSegmentType.map((resItems, i) => {
          this.mainCatItems = this.segmentForm.get('mainCatItems') as UntypedFormArray;
          if (resItems['category_name'] === 'Equity') {
            resItems['selected'] = true;
            resItems['is_disable'] = true;
          }
          if (resItems['category_name'] === 'Mutual Funds') {
            resItems['selected'] = true;
            resItems['is_disable'] = true;
          }
          // console.log('resItems', resItems);
          this.mainCatItems.push(this.createSegment(resItems));
          let control = (<UntypedFormArray>this.segmentForm.controls['mainCatItems']).at(i).get('sub_cat_items') as UntypedFormArray;
          if (resItems.sub_categories.length) {
            resItems.sub_categories.map((subItem, j) => {
              subItem['category_id'] = resItems['category_id'];
              if (resItems['selected'] === true) {
                subItem['subcate_selected'] = true;
              }
              this.subCatItems = this.segmentForm.get('subCatItems') as UntypedFormArray;
              control.push(this.createSubSegment(subItem));
              const controlPlan = ((<UntypedFormArray>this.segmentForm.controls['mainCatItems']).at(i).get('sub_cat_items') as UntypedFormArray).at(j).get('plans') as UntypedFormArray;
              if (subItem.plans.length) {
                if (resItems['selected'] === true) {
                  subItem.plans[0]['plan_selected'] = true;
                }
                subItem.plans.map((planItem, indexPlan) => {
                  // console.log('controlPlan', controlPlan, 'planItem', planItem);
                  controlPlan.push(this.createPlans(planItem));
                  if (planItem.plan_selected) {
                    control['controls'].forEach((subCatCtrl: UntypedFormControl) => {
                      if (subCatCtrl.value.sub_category_id === subItem['id']) {
                        subCatCtrl.patchValue({ plan_id: planItem.id, plan_description: planItem.description });
                      }
                    });
                  }
                });
              }
            });
          }
        });

        this.global.globalLoader(false);
      }
    });
  }

  selectCategory($event, mainCategoryId: any) {
    if ($event.target.checked) {
      const parentArray = this.segmentForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {
          ctrl.patchValue({ selected: true });
          this.defaultSelectSubCategory(true, mainCategoryId);
        }
      });
    } else {
      const parentArray = this.segmentForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {
          ctrl.patchValue({ selected: false });
          this.defaultSelectSubCategory(false, mainCategoryId);
        }
      });
    }
  }

  /**
   * Default select sub category and plan ON 23 DEC 2020
   */
  defaultSelectSubCategory(checked, mainCategoryId: any) {
    if (checked) {
      const parentArray = this.segmentForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {
          ctrl.patchValue({ selected: true });
          let subCatFormArray = ctrl.get('sub_cat_items') as UntypedFormArray;
          subCatFormArray.controls.forEach((ctrlsub: UntypedFormControl) => {
            ctrlsub.patchValue({ subcate_selected: true });
            if (ctrlsub.get('plans')['controls']) {
              let plansArray = ctrlsub.get('plans')['controls'] as UntypedFormArray;
              // console.log('plansArray', plansArray, plansArray[0].get('plan_id').value, plansArray[0].get('description').value);
              ctrlsub.patchValue({ plan_id: plansArray[0].get('plan_id').value, plan_description: plansArray[0].get('description').value });
              plansArray[0].markAsTouched();
              plansArray[0].patchValue({ plan_selected: true });
            }
          });
        }
      });
      // console.log('parentArray', parentArray);
    } else if (!checked) {
      const parentArray = this.segmentForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {
          ctrl.patchValue({ selected: false });
          let subCatFormArray = ctrl.get('sub_cat_items') as UntypedFormArray;
          subCatFormArray.controls.forEach((ctrlsub: UntypedFormControl) => {
            ctrlsub.patchValue({ subcate_selected: false });
            if (ctrlsub.get('plans')['controls']) {
              let plansArray = ctrlsub.get('plans')['controls'] as UntypedFormArray;
              ctrlsub.patchValue({ plan_id: '', plan_description: '' });
              plansArray[0].markAsTouched();
              plansArray[0].patchValue({ plan_selected: false });
            }
          });
        }
      });
    }
  }

  /**
   * select segment sub category
   */
  selectSubCategory($event, mainCategoryId: any) {
    if ($event.target.checked) {
      const parentArray = this.segmentForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {
          ctrl.patchValue({ selected: true });
          let subCatFormArray = ctrl.get('sub_cat_items') as UntypedFormArray;
          subCatFormArray.controls.forEach((ctrlsub: UntypedFormControl) => {
            ctrlsub.patchValue({ subcate_selected: true });
            if (ctrlsub.get('plans')['controls']) {
              let plansArray = ctrlsub.get('plans')['controls'] as UntypedFormArray;
              // console.log('plansArray', plansArray, plansArray[0].get('plan_id').value, plansArray[0].get('description').value);
              ctrlsub.patchValue({ plan_id: plansArray[0].get('plan_id').value, plan_description: plansArray[0].get('description').value });
              plansArray[0].markAsTouched();
              plansArray[0].patchValue({ plan_selected: true });
            }
          });
        }
      });
      // console.log('parentArray', parentArray);
    } else {
      const parentArray = this.segmentForm.get('mainCatItems') as UntypedFormArray;
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {
          ctrl.patchValue({ selected: false });
          let subCatFormArray = ctrl.get('sub_cat_items') as UntypedFormArray;
          subCatFormArray.controls.forEach((ctrlsub: UntypedFormControl) => {
            ctrlsub.patchValue({ subcate_selected: false });
            if (ctrlsub.get('plans')['controls']) {
              let plansArray = ctrlsub.get('plans')['controls'] as UntypedFormArray;
              ctrlsub.patchValue({ plan_id: '', plan_description: '' });
              plansArray[0].markAsTouched();
              plansArray[0].patchValue({ plan_selected: false });
            }
          });
        }
      });
    }
  }
  /**
   * Change Brokerage Plan
   * @param $event 
   * @param mainCategoryId 
   * @param subCategoryId 
   */
  selectPlan($event, mainCategoryId: string | number, subCategoryId: string | number) {
    // console.log('planId', $event.target.value, mainCategoryId, subCategoryId);
    const planId = $event.target.value;
    let parentArray = this.segmentForm.get('mainCatItems') as UntypedFormArray;
    if (planId) {
      // console.log('parentArray.controls', parentArray.controls);
      parentArray.controls.map((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {//match with category id
          ctrl.patchValue({ selected: true });
          let subCatFormArray = ctrl.get('sub_cat_items') as UntypedFormArray;
          console.log('subCatFormArray', ctrl.get('sub_cat_items'), subCatFormArray);
          subCatFormArray.controls.forEach((ctrlsub: UntypedFormControl) => {
            if (ctrlsub.value.sub_category_id === subCategoryId) {//match with subcategory id
              ctrlsub.patchValue({ subcate_selected: true });
              if (ctrlsub.get('plans')['controls']) {// plan control array
                let plansArray = ctrlsub.get('plans') as UntypedFormArray;
                plansArray.controls.forEach((planCtrl: UntypedFormControl) => {
                  planCtrl.patchValue({ plan_selected: false });
                  if (planCtrl.get('plan_id').value === planId) {//match with plan id
                    ctrlsub.patchValue({ plan_id: planCtrl.get('plan_id').value, plan_description: planCtrl.get('description').value });
                    ctrlsub.markAsTouched();
                    planCtrl.patchValue({ plan_selected: true });
                  }
                });
              }
            }
          });
        }
      });
    } else { // deselect main category, subcategory, plans too...
      parentArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value.category_id === mainCategoryId) {//match with category id
          ctrl.patchValue({ selected: false });
          let subCatFormArray = ctrl.get('sub_cat_items') as UntypedFormArray;
          // console.log('subCatFormArray', subCatFormArray);
          subCatFormArray.controls.forEach((ctrlsub: UntypedFormControl) => {
            // if (ctrlsub.value.sub_category_id === subCategoryId) {//match with subcategory id
            ctrlsub.patchValue({ subcate_selected: false });
            if (ctrlsub.get('plans')['controls']) {
              let plansArray = ctrlsub.get('plans') as UntypedFormArray;
              plansArray.controls.forEach((planCtrl: UntypedFormControl) => {
                // if (planCtrl.get('plan_id').value === planId) {//match with plan id
                ctrlsub.patchValue({ plan_id: '', plan_description: '' });
                ctrlsub.markAsTouched();
                planCtrl.patchValue({ plan_selected: false });
                // }
              });
            }
            // }
          });
        }
      });
    }
  }

  openDisclaimer() {
    console.log('openDisclaimer');
    this.modalService.open(this.disclaimerModal, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => { });
  }

  /**
   * save segment brokerage
   */
  onSubmit() {
    const valueOfForm = this.segmentForm.value;
    const selectedData = valueOfForm.mainCatItems.filter(ele => ele.selected === true);
    // return;
    if (!selectedData.length) {
      this.global.errorToastr(this.translate.instant('brokerage_plan'));
      return;
    }
    if (!this.segmentForm.value.isTermsCondition) {
      this.global.warningToastr('Please agreed the terms and conditions before submit.');
      return;
    }
    let objParams = [];
    selectedData.map((item) => {
      if (item.sub_cat_items.length) {
        item.sub_cat_items.map((subItem) => {
          const currentPage = {};
          if (subItem['plan_id']) {
            currentPage['category_id'] = subItem['category_id'];
            currentPage['sub_category_id'] = subItem['sub_category_id'];
            currentPage['plan_id'] = subItem['plan_id'];
            objParams.push(currentPage);
          }
          // if (subItem['plan_id']) {
          //   currentPage['is_sub_cat_exists'] = true;
          // }
          // console.log('currentPage', currentPage);
        });
      } else {
        const currentPage = {};
        currentPage['category_id'] = item['category_id'];
        currentPage['sub_category_id'] = '0';
        currentPage['plan_id'] = '0';
        objParams.push(currentPage);
      }
    });
    const planData = { planData: objParams };
    planData['POA'] = this.segmentForm.get('POA').value;
    planData['demat'] = this.segmentForm.get('demat').value;
    planData['isTermsCondition'] = this.segmentForm.get('isTermsCondition').value;
    if (this.rmCode) {
      planData['code'] = this.rmCode;
    }
    this.dashboardService.segmentSubmit(planData).subscribe((res) => {
      if (res.success) {
        this.global.successToastr(res.message);
        this.verifiedSteps['isSegmentVerified'] = true;
        this.verifiedSteps['isTrandingAccountType'] = true;
        this.sharedVarService.setStepsInfo(this.verifiedSteps);
        this.dashboardService.getStepsInfo().subscribe((res) => {
          if (res.success) {
            this.sharedVarService.setStepsInfo(res.result);
            this.verifiedSteps = res.result;
          }
        });
        this.global.redirectToPage('nominee-details');
      } else {
        this.global.errorToastr(res.message);
      }
    });
  }
}
