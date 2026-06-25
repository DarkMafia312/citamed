import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionistasForm } from './recepcionistas-form';

describe('RecepcionistasForm', () => {
  let component: RecepcionistasForm;
  let fixture: ComponentFixture<RecepcionistasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecepcionistasForm],
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionistasForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
