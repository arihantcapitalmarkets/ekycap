import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPanDobComponent } from './register-pan-dob.component';

describe('RegisterPanDobComponent', () => {
  let component: RegisterPanDobComponent;
  let fixture: ComponentFixture<RegisterPanDobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPanDobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPanDobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
