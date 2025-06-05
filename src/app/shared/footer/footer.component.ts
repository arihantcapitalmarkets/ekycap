import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true
})
export class FooterComponent implements OnInit {
  env = environment;
  faqUrl = `${environment.faqUrl}`;
  currentYear: string | number;
  constructor(public global: GlobalService) { }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
  }

}
