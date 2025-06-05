import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BotAutologinServiceService {

    constructor(
        private http: HttpClient
    ) { }
    /**
     * For login from authorize token checking
     * @param Token
     */
    tokenAuthentication(objParam: any): Observable<any> {
        return this.http.post<any>(`${environment.baseUrl}api/validateBoatToken`, objParam);
    }
}