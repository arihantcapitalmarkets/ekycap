import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalService } from 'src/app/services/global.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EsignService } from 'src/app/esign-flow/esign.service';

@Injectable({ providedIn: 'root' })
export class eSignTokenResolver implements Resolve<any> {
  constructor(
    private esignService: EsignService,
    public global: GlobalService,
    private router: Router,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<any> | Promise<any> | any {
    const token: string = route.paramMap.get('token');
    return this.esignService.validateEsignTOKENProcess(token);

  }
}