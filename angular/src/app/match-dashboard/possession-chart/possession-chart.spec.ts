import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PossessionChart } from './possession-chart';

describe('PossessionChart', () => {
  let component: PossessionChart;
  let fixture: ComponentFixture<PossessionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PossessionChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PossessionChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
