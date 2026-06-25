import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiPerfilRecepcionista } from './mi-perfil-recepcionista';

describe('MiPerfilRecepcionista', () => {
  let component: MiPerfilRecepcionista;
  let fixture: ComponentFixture<MiPerfilRecepcionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiPerfilRecepcionista],
    }).compileComponents();

    fixture = TestBed.createComponent(MiPerfilRecepcionista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
