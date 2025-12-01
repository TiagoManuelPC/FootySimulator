import { Component, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-possession-chart',
    standalone: true,
    imports: [BaseChartDirective],
    templateUrl: './possession-chart.html',
    styleUrls: ['./possession-chart.css'],
})
export class PossessionChart {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    public doughnutChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';
    public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: ['Liverpool FC', 'Manchester City'],
        datasets: [{ data: [50, 50] }]
    };
    // Disable animations so updates are instantaneous
    public options: any = { responsive: true, maintainAspectRatio: false, animation: { duration: 0 } };

    update(labels: string[], values: number[]) {
        // assign a new object so bindings detect the change
        this.doughnutChartData = {
            labels: labels,
            datasets: [{ data: values }]
        };

        // ask the underlying chart to update if available
        try {
            this.chart?.update();
        } catch (e) {
            // ignore update errors in environments where chart isn't initialized yet
        }
    }
}
