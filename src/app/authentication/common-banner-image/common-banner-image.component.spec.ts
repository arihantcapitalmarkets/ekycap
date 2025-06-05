import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonBannerImageComponent } from './common-banner-image.component';

describe('CommonBannerImageComponent', () => {
  let component: CommonBannerImageComponent;
  let fixture: ComponentFixture<CommonBannerImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonBannerImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonBannerImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
