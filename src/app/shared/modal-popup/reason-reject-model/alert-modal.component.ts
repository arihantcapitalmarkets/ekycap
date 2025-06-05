import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, Validators, UntypedFormGroup, UntypedFormArray, FormControl, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  standalone: true,
  imports: [FormsModule, TranslateModule, CommonModule]
})
export class AlertModalComponent implements OnInit {
  @Input() objectOfModal: any;

  listOfReasons: any[] = [];
  getReasonArray: UntypedFormArray;
  reasonDetailsform: UntypedFormGroup;
  selectedReasonsArray: any[];
  favReasonsError: boolean = true;
  constructor(
    public fb: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    this.activeModal.close(true);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

}
