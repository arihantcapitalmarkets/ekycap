import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonLeftportionComponent } from './common-leftportion.component';

describe('CommonLeftportionComponent', () => {
  let component: CommonLeftportionComponent;
  let fixture: ComponentFixture<CommonLeftportionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonLeftportionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonLeftportionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
