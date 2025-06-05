import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FileUploadModule } from 'ng2-file-upload';
import { WebcamModule } from 'ngx-webcam';
// import { SignaturePadModule } from 'ngx-signaturepad';

import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { NgxSpinnerModule } from 'ngx-spinner';
import { PipesModule } from '../shared/pipes/PipesModule';

import { ImageCropperModule } from 'ngx-image-cropper';
import { InputMaskModule } from 'racoon-mask-raw';

import { FutureoptionsUploadRoutingModule } from './futureoptions-upload-routing.module';
import { FutureoptionComponent } from './futureoption/futureoption.component';
import { DashboardService } from '../dashboard/dashboard.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    // NgxSpinnerModule,

    InputMaskModule,
    TranslateModule,
    FileUploadModule,
    WebcamModule,
    SharedModule,
    ReactiveFormsModule,
    PipesModule,
    ImageCropperModule,
    FutureoptionsUploadRoutingModule
  ],
  providers: [
    DashboardService, NgbActiveModal
  ]
})
export class FutureoptionsUploadModule { }
