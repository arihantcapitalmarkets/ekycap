import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-template-error-messages',
  styleUrls: ['./template-error-messages.component.scss'],
  standalone: true,
  template: `<div class="error" *ngIf="errorMessage !== null">{{errorMessage}}</div>`
})
export class TemplateErrorMessagesComponent {
  @Input() control: FormControl;
  @Input() touched: any;
  @Input() fieldName: string;
  constructor(public translate: TranslateService, private ValidationService: ValidationService) { }

  get errorMessage() {
    if (this.control) {
      for (const propertyName in this.control.errors) {
        if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
          const errorMessage = this.ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName], this.fieldName);
          // console.log(this.translate.instant(errorMessage));
          return this.translate.instant(errorMessage);
        }
      }
      return null;
    }
  }

}