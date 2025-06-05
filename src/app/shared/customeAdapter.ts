import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '/';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {

      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    let day: any;
    if (date) {
      if (date.day < 10) {
        day = `0${date.day}`
      } else {
        day = date.day;
      }
    }
    let month: any;
    if (date) {
      if (date.month < 10) {
        month = `0${date.month}`
      } else {
        month = date.month;
      }
    }
    return date ? day + this.DELIMITER + month + this.DELIMITER + date.year : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string | any): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    let day: any;
    if (date) {
      if (date.day < 10) {
        day = `0${date.day}`
      } else {
        day = date.day;
      }
    }
    let month: any;
    if (date) {
      if (date.month < 10) {
        month = `0${date.month}`
      } else {
        month = date.month;
      }
    }
    // console.log('format', date);
    return date ? day + this.DELIMITER + month + this.DELIMITER + date.year : '';
  }
}