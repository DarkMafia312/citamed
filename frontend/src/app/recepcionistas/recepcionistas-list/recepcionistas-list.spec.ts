import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionistasList } from './recepcionistas-list';

describe('RecepcionistasList', () => {
  let component: RecepcionistasList;
  let fixture: ComponentFixture<RecepcionistasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecepcionistasList],
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionistasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
