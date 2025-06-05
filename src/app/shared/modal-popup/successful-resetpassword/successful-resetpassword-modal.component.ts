import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-successful-resetpassword',
    templateUrl: './successful-resetpassword-modal.component.html',
    standalone: true,
    imports: [TranslateModule]
})
export class SuccessfulResetpasswordModalComponent implements OnInit {
    constructor(
        private router: Router,
        private activeModal: NgbActiveModal
    ) { }

    ngOnInit() {
    }

    public decline() {
        this.activeModal.close(false);
        this.router.navigate(['/']);
    }

    public accept() {
        this.activeModal.close(true);
    }

    public dismiss() {
        this.activeModal.dismiss();
    }

}
