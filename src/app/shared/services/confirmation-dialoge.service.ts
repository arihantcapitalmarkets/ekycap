import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../modal-popup/reason-reject-model/alert-modal.component';
import { SuccessfulResetpasswordModalComponent } from '../modal-popup/successful-resetpassword/successful-resetpassword-modal.component';
import { EmailVerificationComponent } from '../modal-popup/email-verification/email-verification.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  constructor(private modalService: NgbModal) { }

  public alertMessageAndConfirm(objectOfModal: any = ''): Promise<boolean> {
    const modalRef = this.modalService.open(AlertModalComponent, { centered: true, backdrop: 'static', keyboard: false });
    modalRef.componentInstance.objectOfModal = objectOfModal;
    return modalRef.result;
  }

  public emailVerification(objectOfModal: any = ''): Promise<boolean> {
    const modalRef = this.modalService.open(EmailVerificationComponent, { centered: true, backdrop: 'static', keyboard: false });
    modalRef.componentInstance.objectOfModal = objectOfModal;
    return modalRef.result;
  }


  public SuccessfulResetPasswordModalPopup(): Promise<boolean> {
    const modalRef = this.modalService.open(SuccessfulResetpasswordModalComponent, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
    return modalRef.result;
  }

}
