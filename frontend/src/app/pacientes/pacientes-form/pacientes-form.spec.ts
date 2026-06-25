import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesForm } from './pacientes-form';

describe('PacientesForm', () => {
  let component: PacientesForm;
  let fixture: ComponentFixture<PacientesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PacientesForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
