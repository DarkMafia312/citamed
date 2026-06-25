import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialForm } from './historial-form';

describe('HistorialForm', () => {
  let component: HistorialForm;
  let fixture: ComponentFixture<HistorialForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistorialForm],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
