import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosList } from './horarios-list';

describe('HorariosList', () => {
  let component: HorariosList;
  let fixture: ComponentFixture<HorariosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HorariosList],
    }).compileComponents();

    fixture = TestBed.createComponent(HorariosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
