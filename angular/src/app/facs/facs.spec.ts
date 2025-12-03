import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Facs } from './facs';

describe('Facs', () => {
  let component: Facs;
  let fixture: ComponentFixture<Facs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Facs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Facs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
