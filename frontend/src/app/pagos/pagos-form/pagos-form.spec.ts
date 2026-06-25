import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosForm } from './pagos-form';

describe('PagosForm', () => {
  let component: PagosForm;
  let fixture: ComponentFixture<PagosForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagosForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
