import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultoriosList } from './consultorios-list';

describe('ConsultoriosList', () => {
  let component: ConsultoriosList;
  let fixture: ComponentFixture<ConsultoriosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultoriosList],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultoriosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
