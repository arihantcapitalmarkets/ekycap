import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-esign',
  templateUrl: './esign.component.html',
  styleUrls: ['./esign.component.scss'],
  standalone: true,
})
export class EsignComponent implements OnInit {
  isEsign: boolean;
  isEsignXmlData: any;
  esignActionUrl = environment.esignActionUrl;
  constructor(
    private route: ActivatedRoute,
    private global: GlobalService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    const esignData = this.route.snapshot.data['esignData'];
    if (esignData.success) {
      if (esignData?.result?.response) {
        this.isEsign = true;
        //  esignData.result.response;
        this.isEsignXmlData = this.decode(esignData.result.response);
      }
    } else {
      this.global.errorToastr(this.translate.instant('ESIGN_PROCESS_NOT_VALID'));
    }
  }

  decode(input) {
    if (/&amp;|&quot;|&#39;|'&lt;|&gt;/.test(input)) {
      const doc = new DOMParser().parseFromString(input, "text/html");
      return doc.documentElement.textContent;
    }
    return input;
  }

}
