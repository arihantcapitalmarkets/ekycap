import { environment } from 'src/environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from "ngx-spinner";
// import { BrowserCookiesModule } from '@ngx-utils/cookies/browser';

import { AuthService } from './services/auth.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ToastrModule } from 'ngx-toastr';

import { HttpClient, HTTP_INTERCEPTORS, HttpParams, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ValidationService } from './services/validation.service';
import { GlobalService } from './services/global.service';

import { HttpinterceptorService } from './services/httpinterceptor.service';
import { SharedVarService } from './services/sharedVar.service';
import { eSignResolver } from './esign-flow/shared/esign.resolver';
import { googleAuthResolver } from './authentication/shared/googleAuth.resolver';
import { CookieService } from 'ngx-cookie-service';

import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';

const googleLoginOptions = {
  scope: 'profile email',
  plugin_name: 'login' //you can use any name here
};

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

/** For Translation */
export function createTranslateLoader(http: HttpClient) {
  // http['params'] = new HttpParams().set('hideLoader', 'true');
  return new TranslateHttpLoader(http, `${environment.languageParamUrl}i18n/`, '.json');
}



@NgModule({
  declarations: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [],
  imports: [
    // BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    // BrowserCookiesModule.forRoot({
    //   secure: true,      // Ensures cookies are only sent over HTTPS
    //   httpOnly: true     // Prevents access to cookies via JavaScript (on server-side for security)
    // }),
    AppRoutingModule,
    NgxSpinnerModule.forRoot({ type: 'ball-fussion' }),
    ToastrModule.forRoot({ timeOut: 4000, positionClass: 'toast-top-right', preventDuplicates: true }),
    SocialLoginModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpinterceptorService, multi: true },
    // AuthGuard,
    // RouteGuard,
    ValidationService,
    GlobalService,
    AuthService,
    SharedVarService,
    eSignResolver,
    googleAuthResolver,
    AppComponent,
    CookieService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            // provider: new GoogleLoginProvider(environment.googleClientID, googleLoginOptions),
            provider: new GoogleLoginProvider(environment.googleClientID)
          },
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
export class AppModule {
  ngDoBootstrap(appRef: ApplicationRef): void {
    appRef.bootstrap(AppComponent);
  }
}
