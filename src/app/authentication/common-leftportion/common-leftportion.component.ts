import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
// import { CookiesService } from '@ngx-utils/cookies';
import { GlobalService } from 'src/app/services/global.service';
import { SharedVarService } from 'src/app/services/sharedVar.service';

@Component({
  selector: 'app-common-leftportion',
  templateUrl: './common-leftportion.component.html',
  styleUrls: ['./common-leftportion.component.scss'],
  standalone: true
})
export class CommonLeftportionComponent implements OnInit {
  contentData: any;
  rmcodeAvailable: boolean;
  subrmcodeAvailable: boolean;
  idArihantPlusAvailable: boolean;
  constructor(
    public global: GlobalService,
    private sharedVarService: SharedVarService,
    private cookieService: CookieService
  ) {

  }

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

    this.sharedVarService.getSiteContentData().subscribe((res: any) => {
      this.contentData = res;
    });
  }

}
