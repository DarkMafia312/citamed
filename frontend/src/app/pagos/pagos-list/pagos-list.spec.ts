import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosList } from './pagos-list';

describe('PagosList', () => {
  let component: PagosList;
  let fixture: ComponentFixture<PagosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagosList],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
