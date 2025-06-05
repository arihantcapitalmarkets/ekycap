import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EsignService {
  baseUrlOfUser = environment.baseUrlOfUser + 'api/';
  baseUrl = environment.baseUrl + 'api/';
  imageUploadUrl = environment.image_upload_url + 'api/';
  constructor(
    private http: HttpClient
  ) { }

  /**
   * Send code of DGlocker in back to get issued documents
   */
  validateEsignProcess(token): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}requestESignForUser/${token}`);
  }

  validateEsignTOKENProcess(token): Observable<any> {
    const data = { token: token }
    return this.http.post<any>(`${this.baseUrl}esignTokenCheck/${token}`, data);
  }
}
