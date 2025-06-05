import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { TranslateLoader } from '@ngx-translate/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TranslationService implements TranslateLoader {
  enJrl = environment.languageParamUrl;
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<any> {
    const params = new HttpParams().set('hideLoader', 'true');
    return this.http.get(`${this.enJrl}i18n/${lang}.json`, { params });
  }
}