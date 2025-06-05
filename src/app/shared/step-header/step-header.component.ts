import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from 'src/app/services/global.service';
import { UntypedFormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { environment } from 'src/environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ControlMessagesComponent } from "../control-messages/control-messages.component";

@Component({
  selector: 'app-step-header',
  templateUrl: './step-header.component.html',
  styleUrls: ['./step-header.component.scss'],
  standalone: true,
  imports: [TranslateModule, CommonModule, ReactiveFormsModule, ControlMessagesComponent]
})
export class StepHeaderComponent implements OnInit {
  @Input() userInfo: any;
  @Input() whichPage: any;
  @ViewChild('needHelpModal') needHelpModal: any;
  needHelpForm: any;
  verifiedSteps: any;
  contentData: any;
  needHelpPopupText: any;
  needHelp = `${environment.needHelp}`;
  constructor(
    public fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private global: GlobalService,
    private serviceVarService: SharedVarService
  ) { }

  ngOnInit(): void {
    this.serviceVarService.getStepsInfo().subscribe((value) => {
      this.verifiedSteps = value;
    });
    this.setFormValidation();
    this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.needHelpPopupText = data?.need_help_popup_text;
      }
    });
  }

  setFormValidation() {
    this.needHelpForm = this.fb.group({
      subject: new FormControl('', [Validators.required]),
      message: new FormControl('', [Validators.required]),
    });
    this.needHelpForm.reset();
  }

  /**
  * Restart Application
  */
  openNeedHelpPopup() {
    this.modalService.open(this.needHelpModal, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => {
      if (result === 'ok') {
        const paramObj: any = this.needHelpForm.value;
        this.global.submitQuery(paramObj).subscribe((res) => {
          if (res.success) {
            this.global.successToastr(res.message);
          }
        });
      }
    });
  }

  onSubmit() {

  }

}
