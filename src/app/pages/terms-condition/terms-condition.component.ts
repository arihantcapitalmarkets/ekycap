import { Component, OnInit } from '@angular/core';
import { FooterComponent } from 'src/app/shared/footer/footer.component';

@Component({
  selector: 'app-terms-condition',
  templateUrl: './terms-condition.component.html',
  styleUrls: ['./terms-condition.component.scss'],
  standalone: true,
  imports: [FooterComponent]
})
export class TermsConditionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
