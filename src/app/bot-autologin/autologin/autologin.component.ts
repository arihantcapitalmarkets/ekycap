import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BotAutologinServiceService } from '../bot-autologin-service.service';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { environment } from 'src/environments/environment';
// import { CookiesService } from '@ngx-utils/cookies';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { EsignService } from 'src/app/esign-flow/esign.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-autologin',
    templateUrl: './autologin.component.html',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutologinComponent implements OnInit {

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private botAutologinService: BotAutologinServiceService,
        public global: GlobalService,
        private sharedVarService: SharedVarService,
        private cookieService: CookieService,
        private dashboardService: DashboardService,
        private esignService: EsignService,
        // private spinner: NgxSpinnerService
    ) { }
    screenHeight: number | string;
    ngOnInit(): void {
        this.onResizeScreen();
        // setTimeout(() => {

        this.route.queryParams.subscribe(params => {
            if (params['token']) {
                this.checkToken(params['token']);
            }
        });
        // }, 5000);
        // this.spinner.show();
    }

    @HostListener("window:resize", [])
    private onResize() {
        this.onResizeScreen();
    }

    onResizeScreen() {
        this.screenHeight = window.innerHeight / 1.5;
    }

    /**
     * Check Token
     * @param token 
     */
    checkToken(token: string) {
        const objParam = { 'token': token };
        this.cookieService.delete('user_auth_token');
        this.botAutologinService.tokenAuthentication(objParam).subscribe((res: any) => {
            if (res.success) {

                if (res?.result?.refreshToken) {
                    this.global.setRefreshToken(res?.result?.refreshToken);
                }

                // this.cookieService.set('user_auth_token', res.result.token);
                this.global.setCookieAuthUserToken(res.result.token);

                this.global.getStepsInfo().subscribe((resultData: any) => {


                    if (resultData.success) {
                        if (resultData?.result?.isBeta && resultData?.result?.is_boat_user) {
                            this.sharedVarService.setStepsInfo(resultData?.result);

                            this.route.queryParams.subscribe(params => {
                                if (params['esign_redirect']) {
                                    this.openEsignPage(params['esign_redirect']);
                                } else {
                                    if (resultData?.result?.boat_stage === "cams") {
                                        this.fetchBankStatement();
                                    } else if (resultData?.result?.boat_stage === "esign") {
                                        this.finishTheEKYC(resultData?.result);
                                    } else if (resultData?.result?.boat_stage === "declarations") {
                                        this.global.globalLoaderMessage();
                                        this.global.redirectTothePage('declarations');
                                    } else if (resultData?.result?.boat_stage === "ESIGN_COMPLETED") {
                                        this.finishTheEKYC(resultData?.result);
                                        // this.openMobileWindow(`${environment?.mobileEsignReturnUrl}?success=1&message="Esign Successfully`);
                                    } else if (!resultData?.result?.isDigiLockerVerified) {
                                        this.openDigilocker(resultData?.result?.auth_code);
                                    } else if (!resultData?.result?.isDeclaration) {
                                        this.global.globalLoaderMessage();
                                        this.global.redirectToFirstUnVerifiedPage(resultData?.result);
                                    }
                                }
                            })

                        } else {
                            this.global.redirectToFirstUnVerifiedPage(resultData?.result);
                            this.global.warningToastr('You are not Mobile app user, please try with Mobile app');
                        }
                    }
                })
            } else {
                if (res?.message) {
                    this.global.errorToastr(res?.message);
                } else {
                    this.global.errorToastr('Data not found, please try again...')
                }
                this.router.navigate(['/']);
            }
        }, error => {
            this.router.navigate(['/']);
            this.global.errorToastr('Server Error, please try again...');
        })
    }

    openDigilocker(auth_code: string) {
        const url = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${environment.client_id}&redirect_uri=${environment.redirect_uri}&state=ABC123r876&code_challenge=${auth_code}&code_challenge_method=S256`;
        // const url = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${environment.client_id}&redirect_uri=${environment.redirect_uri}&state=ABC123r876&code_challenge=${auth_code}&code_challenge_method=S256`;
        window.location.href = url;
    }

    openEsignPage(url: string = '') {
        window.location.href = url;
    }

    /**
* Fetch Bank Statement using CAMS service
*/
    fetchBankStatement() {
        this.dashboardService.fetchCamsdetails().subscribe((res: any) => {
            if (res.success) {
                if (res?.result?.url) {
                    this.openMobileWindow(res?.result?.url);
                } else {
                    this.openMobileWindow(`${environment?.mobileCamsKRAReturnUrl}?success=0&message="Bank Statement Failed`);
                }
            } else {
                this.openMobileWindow(`${environment?.mobileCamsKRAReturnUrl}?success=0&message="Bank Statement Failed`);
            }
        }, error => {
            this.openMobileWindow(`${environment?.mobileCamsKRAReturnUrl}?success=0&message="Bank Statement Failed`);
        });
    }

    verifiedSteps: any;
    finishTheEKYC(result: any) {
        this.verifiedSteps = result;
        if (!this.verifiedSteps?.isDocumentUploaded) {
            this.openMobileWindow(`${environment?.mobileEsignReturnUrl}?success=0&message="Esign Failed`)
        } else {
            this.dashboardService.finishEKYC().subscribe((res: any) => {
                if (res.success) {
                    if (res?.result?.is_all_step_completed && res?.result?.is_email_verified && res?.result?.isEKYCComplete) {
                        // this.verifiedSteps.isEKYCComplete = 1;
                        // this.global.successToastr(res?.message);
                        if (res?.result?.esignToken) {
                            setTimeout(() => {
                                this.tokenCheckForEsign(res?.result?.esignToken);
                            }, 1000);
                            // this.router.navigate(['esign', res.result.esignToken]);
                        }
                    } else if (res.result.is_all_step_completed && !res.result.is_email_verified) {
                        this.openMobileWindow(`${environment?.mobileEsignReturnUrl}?success=0&message="Esign Failed`)
                    }
                } else {
                    this.openMobileWindow(`${environment?.mobileEsignReturnUrl}?success=0&message="Esign Failed`)
                }
            });
        }
    }

    tokenCheckForEsign(esignToken: any) {
        this.global.globalLoaderMessage('creating Esign file...');
        this.esignService.validateEsignProcess(esignToken).subscribe((esignData: any) => {
            if (esignData.success) {
                // console.log('esignData', esignData); return;
                this.global.globalLoaderMessage();
                if (esignData?.result?.esignUrl) {
                    window.location.href = esignData?.result?.esignUrl;
                    // this.openMobileWindow(`${esignData?.result?.esignUrl}?success=1&message="gotoEsign`);
                } else {
                    this.openMobileWindow(`${environment?.mobileEsignReturnUrl}?success=0&message="Esign Failed`)
                }

            } else {
                this.openMobileWindow(`${environment?.mobileEsignReturnUrl}?success=0&message="Esign Failed`)
            }
        }, error => {
            if (error?.error?.message) {
                this.global.errorToastr(error?.error?.message);
            }
        });
    }

    openMobileWindow(url: string = "") {
        if (url) {
            window.location.href = url;
        } else {
            this.global.errorToastr("No response found");
        }
    }

}