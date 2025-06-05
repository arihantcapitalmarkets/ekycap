import { SharedVarService } from './services/sharedVar.service';
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef, Input, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from './services/global.service';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
// import { CookiesService } from "@ngx-utils/cookies";
import { environment } from 'src/environments/environment';
import { interval, Subscription } from 'rxjs';
import { Router, RouterEvent, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthenticationService } from './authentication/authentication.service';
import { filter, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerComponent, NgxSpinnerModule } from 'ngx-spinner';
declare let fbq: Function;
// declare let _tfa: any;

declare let ue: any;

function startRecording() {
  ue.startRecording(environment.devRevPrivateKey, {
    sessionReplay: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
        email: true,
        tel: true,
        color: false,
        date: false,
        'datetime-local': false,
        month: false,
        number: false,
        range: false,
        search: false,
        text: false,
        time: false,
        url: false,
        week: false,
        textarea: false,
        select: false,
      }
    }
  });
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgxSpinnerModule, RouterModule, CommonModule, NgxSpinnerComponent]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'ekyc';
  browserLanguage: any;
  language = 'en';
  isPlatformBrowser: boolean;
  // loader: boolean;
  loader: boolean = true;
  contentData: any;
  previousUrl: string = null;
  currentUrl: string = null;
  private subscriptionToken: Subscription;
  showNavbar = true;
  userExperior: any; // Will hold the UserExperior object
  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    public global: GlobalService,
    public translate: TranslateService,
    private cookie: CookieService,
    private sharedVarService: SharedVarService,
    private authenticationService: AuthenticationService,
    @Inject(PLATFORM_ID) private platform: Object
  ) {
    this.isPlatformBrowser = isPlatformBrowser(this.platform);
    const selectedLanguage = this.cookie.get('language');
    if (!selectedLanguage) {
      this.browserLanguage = translate.getBrowserLang(); // For get Browser languge
      this.browserLanguage = this.browserLanguage || 'en';
      this.translate.use(this.browserLanguage);
      this.cookie.set('browserLanguage', this.browserLanguage);
    } else {
      this.global.setLanguage(false);
    }

    router.events.subscribe((y: NavigationEnd) => {
      if (y instanceof NavigationEnd) {
        fbq('track', 'PageView');
        //_tfa.push({ notify: 'event', name: 'leadari', id: 1071663 });
        this.previousUrl = this.currentUrl;
        this.currentUrl = y.url;
        this.sharedVarService.setPreviousUrl(this.previousUrl);
      }
    });
    // this.router.events
    //   .pipe(filter((event) => event instanceof NavigationEnd))
    //   .subscribe((event: NavigationEnd) => {
    //     const currentUrl = event.urlAfterRedirects; // Get the updated URL
    //     const urlLenght = currentUrl.split('/');
    //     console.log('urlLenght', urlLenght);
    //     this.showNavbar = true;
    //     if (urlLenght.length > 1 && urlLenght[1] === 'declarations') {
    //       this.showNavbar = false;
    //     }
    //   });


    // this.setConfigFlow();
    this.getSiteContent();
  }
  isNavBar: boolean;

  ngOnInit(): void {

    this.userExperiorInit();
    // setTimeout(() => {
    //   if (environment.userExperior) {
    //     startRecording()
    //   }
    // }, 1500);
    window.addEventListener('beforeunload', function (event) {
      // console.log('app');
      event.stopImmediatePropagation();
      /*
       * With this the console only print 'app'.
       * If you comment the above line the console will print 'app' and 'home' in that order
       */
    });

  }

  /*********************************** USER EXPERIOR SETUP WITH BYPASS IF JAVASCRUPT NOT WORKING : START ******************************/
  userExperiorInit() {
    this.loadScript('https://unpkg.com/user-experior-web@latest/bundle/ue-web-bundle.js').then((res: any) => {
      // Call the init function after the script is loaded
      // console.log('if window', window['UserExperior']);
      if (window['UserExperior']) {
        this.userExperior = window['UserExperior']; // Store reference
        // console.log('UserExperior Loaded:', this.userExperior);
        if (typeof this.userExperior.init === 'function') {
          console.log('UserExperior init function');
          if (window['initUserExperior']) {
            window['initUserExperior'](); // Call the global function
            startRecording();
            this.sharedVarService.setUserExperiorWorks(true);
          } else {
            this.sharedVarService.setUserExperiorWorks(false);
            // console.log(" Not intitialize USER EXP.");
          }

        }
      } else {
        this.sharedVarService.setUserExperiorWorks(false);
        console.error('UserExperior is not available');
      }
    }).catch((error) => {
      this.sharedVarService.setUserExperiorWorks(false);
      console.error('Error loading script:', error)
    });
  }


  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.defer = true;

      script.onload = () => resolve(); // Resolve when script loads
      script.onerror = () => reject(); // Reject on error

      document.body.appendChild(script);
    });
  }
  /*********************************** USER EXPERIOR SETUP WITH BYPASS IF JAVASCRUPT NOT WORKING : STOP ******************************/

  ngAfterViewInit(): void {
    if (this.cookie.get('user_auth_token')) {
      this.router.events.subscribe((y: NavigationEnd) => {
        if (y instanceof NavigationEnd) {
          const currentUrlArrays = y.url?.split('?');
          const currentUrl = currentUrlArrays[0].split('/');
          // console.log('currentUrl', currentUrl);
          // if (!currentUrl.includes('redirect')) {
          //   this.regenerateToken();
          // }
          // const yesMatch = currentUrl.includes('redirect');
        }
      })
    }
  }


  showLoader() {
    this.loader = true;
  }

  hideLoader() {
    this.loader = false;
  }

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  changeOfRoutes() {
    const element = document.getElementById('bodyId');
    const isClassAvailable = document.getElementById('navbarNavAltMarkup');
    if (element) {
      element.classList.remove('my-class');
    }
  }

  setConfigFlow() {
    // let obj = { 'login_type': environment.login_type };
    const obj = {
      'login_type': 'Mobile_OTP',
      'step1': 'mobile',
      'step2': 'otp',
      'step3': 'email',
      'step4': 'pan_dob'
    }
    this.sharedVarService.setConfigFlowData(obj);

    // this.global.getConfigureFlow(obj).subscribe((res: any) => {
    //   if (res.success) {
    //     this.sharedVarService.setConfigFlowData(res.result);
    //   } else {
    //     const obj = {
    //       'login_type': 'Mobile_OTP',
    //       'step1': 'mobile',
    //       'step2': 'otp',
    //       'step3': 'email',
    //       'step4': 'pan_dob'
    //     }
    //     this.sharedVarService.setConfigFlowData(obj);
    //   }
    // }, error => {
    //   const obj = {
    //     'login_type': 'Mobile_OTP',
    //     'step1': 'mobile',
    //     'step2': 'otp',
    //     'step3': 'email',
    //     'step4': 'pan_dob'
    //   }
    //   this.sharedVarService.setConfigFlowData(obj);
    // })
  }

  obs: Subscription;
  /**
   * Get set up content
   */
  getSiteContent() {
    const obj = { 'login_type': 'Mobile_OTP' };
    // this.contentData = '';
    this.obs = this.global.getSiteContent().subscribe((res: any) => {
      if (res.success) {
        this.sharedVarService.setSiteContentData(res.result);
        this.contentData = res.result;
      }
    }, error => {
    })
  }




  ngOnDestroy(): void {
    this.obs && this.obs.unsubscribe();
    this.subscriptionToken && this.subscriptionToken.unsubscribe();
  }

}
