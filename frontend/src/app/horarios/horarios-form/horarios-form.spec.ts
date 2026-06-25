import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosForm } from './horarios-form';

describe('HorariosForm', () => {
  let component: HorariosForm;
  let fixture: ComponentFixture<HorariosForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HorariosForm],
    }).compileComponents();

    fixture = TestBed.createComponent(HorariosForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
