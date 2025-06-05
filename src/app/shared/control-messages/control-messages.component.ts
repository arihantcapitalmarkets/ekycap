import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-control-messages',
  styleUrls: ['./control-messages.component.scss'],
  standalone: true,
  imports: [CommonModule],
  template: `<div class="error" *ngIf="errorMessage !== null">{{errorMessage}}</div>`
})
export class ControlMessagesComponent {
  @Input() control: FormControl;
  @Input() fieldName: string;
  @Input() customeMessage: string;
  constructor(public translate: TranslateService, private ValidationService: ValidationService) { }

  get errorMessage() {
    if (!this.customeMessage) {
      this.customeMessage = '';
    }
    // console.log('this.control', this.control);
    for (const propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        const errorMessage = this.ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName], this.fieldName, this.customeMessage);
        // console.log(this.translate.instant(errorMessage));
        return this.translate.instant(errorMessage);
      }
    }

    return null;
  }

}



