import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesList } from './pacientes-list';

describe('PacientesList', () => {
  let component: PacientesList;
  let fixture: ComponentFixture<PacientesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PacientesList],
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
