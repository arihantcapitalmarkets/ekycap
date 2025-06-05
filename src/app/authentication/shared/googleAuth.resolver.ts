import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { GlobalService } from "src/app/services/global.service";
import { AuthenticationService } from "../authentication.service";

@Injectable({ providedIn: 'root' })
export class googleAuthResolver implements Resolve<any> {
  constructor(
    private service: AuthenticationService,
    private router: Router,
    public global: GlobalService,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return this.service.googleEmailVerification(route.paramMap.get('code')).subscribe((res: any) => {
      if (res.success) {
        // this.global.successToastr(res.message);
        if (res.result.type === 1) {
          this.router.navigate(['/register-mobile']);
        } else if (res.result.type === 2) {
          this.router.navigate(['/login-otp']);
        }
      }
    }, (error: HttpErrorResponse) => {
      if (error.status === 400) {
        this.router.navigate(['/welcome']);
      }
    });
  }
}