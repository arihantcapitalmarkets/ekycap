import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
// import { CookiesService } from '@ngx-utils/cookies';

@Component({
  selector: 'app-common-banner-image',
  templateUrl: './common-banner-image.component.html',
  styleUrls: ['./common-banner-image.component.scss'],
  standalone: true
})
export class CommonBannerImageComponent implements OnInit {
  rmcodeAvailable: boolean;
  subrmcodeAvailable: boolean;
  idArihantPlusAvailable: boolean;
  constructor(
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    if (this.cookieService.get('rmcode')) {
      this.rmcodeAvailable = true;
    }
    if (this.cookieService.get('subrmcode')) {
      this.subrmcodeAvailable = true;
    }
    if (this.cookieService.get('idArihantPlus')) {
      this.idArihantPlusAvailable = true;
    }
  }

}
