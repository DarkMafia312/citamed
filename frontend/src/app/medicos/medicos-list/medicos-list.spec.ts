import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicosList } from './medicos-list';

describe('MedicosList', () => {
  let component: MedicosList;
  let fixture: ComponentFixture<MedicosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicosList],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
