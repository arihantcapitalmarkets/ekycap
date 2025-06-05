import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NsdlTokenVerifyComponent } from './nsdl-token-verify.component';

describe('NsdlTokenVerifyComponent', () => {
  let component: NsdlTokenVerifyComponent;
  let fixture: ComponentFixture<NsdlTokenVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NsdlTokenVerifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NsdlTokenVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
