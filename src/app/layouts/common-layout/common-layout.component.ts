import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-common-layout',
  templateUrl: './common-layout.component.html',
  styleUrls: ['./common-layout.component.scss'],
  standalone: true,
  imports: [NavbarComponent, RouterModule]
})
export class CommonLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  onActivate(event) {
    window.scroll(0, 0);
    //or document.body.scrollTop = 0;
    //or document.querySelector('body').scrollTo(0,0)
  }

}
