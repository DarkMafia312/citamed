import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultoriosForm } from './consultorios-form';

describe('ConsultoriosForm', () => {
  let component: ConsultoriosForm;
  let fixture: ComponentFixture<ConsultoriosForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultoriosForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultoriosForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
