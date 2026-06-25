import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicosForm } from './medicos-form';

describe('MedicosForm', () => {
  let component: MedicosForm;
  let fixture: ComponentFixture<MedicosForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicosForm],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicosForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
