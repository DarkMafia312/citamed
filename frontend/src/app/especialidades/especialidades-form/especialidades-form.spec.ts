import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecialidadesForm } from './especialidades-form';

describe('EspecialidadesForm', () => {
  let component: EspecialidadesForm;
  let fixture: ComponentFixture<EspecialidadesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EspecialidadesForm],
    }).compileComponents();

    fixture = TestBed.createComponent(EspecialidadesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
