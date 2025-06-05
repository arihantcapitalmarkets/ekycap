import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global.service';
import { AuthService } from 'src/app/services/auth.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { CookiesService } from "@ngx-utils/cookies";
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [TranslateModule, CommonModule, NgbModule]
})
export class NavbarComponent implements OnInit {
  @ViewChild('logoutapp') logoutApplicationModal: any;
  public isLoggedIn: any = false;
  getUserInfo: any;
  public flag: boolean;
  contentData: any;
  logoutPopupText: any;
  idArihantPlus: string;
  needHelp = `${environment.needHelp}`;
  infoSteps: any;
  // showNavbar = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    public global: GlobalService,
    public auth: AuthService,
    private serviceVarService: SharedVarService,
    private cookie: CookieService,
    private modalService: NgbModal,
    private crypto: CryptoService
  ) {
    translate.addLangs(['en', 'es']);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {

    // setTimeout(() => {
    //   this.router.events
    //     .pipe(filter((event) => event instanceof NavigationEnd))
    //     .subscribe((event: NavigationEnd) => {
    //       console.log('event', event);

    //       const currentUrl = event.urlAfterRedirects; // Get the updated URL
    //       const urlLenght = currentUrl.split('/');
    //       console.log('urlLenght', urlLenght);
    //       this.showNavbar = true;
    //       if (urlLenght.length > 1 && urlLenght[1] === 'redirect') {
    //         this.showNavbar = false;
    //       }
    //     });
    // }, 1000);

    this.route.queryParams.subscribe(params => {
      if (params['ID'] && (params['ID'] === environment.idArihantPlus)) {
        this.idArihantPlus = environment.idArihantPlus;
      }
    });
    if (this.cookie.get('idArihantPlus')) {
      this.idArihantPlus = this.cookie.get('idArihantPlus');
    }
    this.serviceVarService.getValue().subscribe((value) => {
      this.isLoggedIn = value;
    });

    this.serviceVarService.getLoggedUserInfoValue().subscribe((result) => {
      this.getUserInfo = result;
    });

    this.serviceVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
      if (this.contentData?.data) {
        const data = JSON.parse(this.contentData?.data);
        this.logoutPopupText = data?.logout_popup_text;
      }
    });

    this.serviceVarService.getStepsInfo().subscribe((value) => {
      if (value) {
        this.infoSteps = value;
      }
    });
  }

  onChangeLanguage(language) {
    this.cookie.set('language', language);
    this.global.setLanguage(true);
  }

  /**
  * Restart Application
  */
  logoutApplication() {
    this.modalService.open(this.logoutApplicationModal, { centered: true, backdrop: 'static', keyboard: false }).result.then((result) => {
      if (result === 'ok') {
        this.auth.logout();
        // this.global.successToastr('Application Restarted');
        // this.router.navigate(['welcome']);
      }
    });
  }

  whatsAppBot() {
    if (this.infoSteps?.mobileNumber) {
      const mobile = this.crypto.decrypt(this.infoSteps.mobileNumber);
      const url = `https://api.whatsapp.com/send/?phone=919993711788&text=Hello&type=${mobile}&app_absent=0`;
      window.location.href = url;
    } else {
      const url = 'https://api.whatsapp.com/send/?phone=919993711788&text=Hello&type=undefined&app_absent=0';
      window.location.href = url;
    }
  }

}
