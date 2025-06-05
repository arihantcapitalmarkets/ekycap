import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-nsdl-token-verify',
  templateUrl: './nsdl-token-verify.component.html',
  styleUrls: ['./nsdl-token-verify.component.scss'],
  standalone: true,
})
export class NsdlTokenVerifyComponent implements OnInit {
  isNSDLVerified: boolean;
  esignActionUrl = environment.esignActionUrl;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private global: GlobalService
  ) { }

  ngOnInit(): void {
    const esignData = this.route.snapshot.data['nsdlData'];
    if (esignData.success) {
      if (esignData?.result?.response) {
        this.isNSDLVerified = true;
        this.router.navigate(['thank-you']);
        //  esignData.result.response;
      }
    } else {
      this.global.errorToastr('NSDL Process does not valid.');
      this.router.navigate(['esign-confirm']);
    }
  }

}
