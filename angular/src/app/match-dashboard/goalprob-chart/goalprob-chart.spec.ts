import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalprobChart } from './goalprob-chart';

describe('GoalprobChart', () => {
  let component: GoalprobChart;
  let fixture: ComponentFixture<GoalprobChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalprobChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalprobChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
