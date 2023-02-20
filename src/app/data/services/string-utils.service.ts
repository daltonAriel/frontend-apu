import { Injectable } from '@angular/core';
import * as moment from 'moment';



@Injectable({
  providedIn: 'root'
})
export class StringUtilsService {

  constructor() { }

  convertDate(_date: moment.Moment): string {
    try {
      if (!_date) {
       return '';
      }
      
      return _date.format("DD/MM/YYYY");
    } catch (e) {
      return '';
    }
  }


  dropExtraSpaces(_cadena: string): string {
    try {
      return _cadena.trim().replace(/\s+/g, ' ');
    } catch (e) {
      return '';
    }
  }


}
