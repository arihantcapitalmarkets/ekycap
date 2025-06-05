import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EsignConfirmComponent } from './esign-confirm.component';

describe('EsignConfirmComponent', () => {
  let component: EsignConfirmComponent;
  let fixture: ComponentFixture<EsignConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EsignConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EsignConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
