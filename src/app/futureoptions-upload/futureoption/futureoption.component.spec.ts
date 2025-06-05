import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureoptionComponent } from './futureoption.component';

describe('FutureoptionComponent', () => {
  let component: FutureoptionComponent;
  let fixture: ComponentFixture<FutureoptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureoptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureoptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
