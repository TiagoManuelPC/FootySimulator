import { Component, signal, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatchEvent } from '../../services/match-signalr.service';

@Component({
    selector: 'app-goalprob-chart',
    standalone: true,
    imports: [BaseChartDirective],
    templateUrl: './goalprob-chart.html',
    styleUrls: ['./goalprob-chart.css'],
})

export class GoalprobChart {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    public lineChartType: ChartConfiguration<'line'>['type'] = 'line';
    public lineChartData = signal<ChartConfiguration<'line'>['data']>({
        labels: [],
        datasets: [{ data: [], label: 'Goal Probability', fill: true }]
    });
    public options: any = { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 1 } } };

    public lastProbMap: { [id: string]: number } = {};

    pushPoint(ev: MatchEvent, prob: number) {
        const label = `${ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()} ${ev.playerId}`;
        // Create new arrays (do not mutate in-place) and set the signal
        const prev = this.lineChartData();
        const newLabels = [...(prev.labels || []), label].slice(-20);
        const prevDs = (prev.datasets || [])[0];
        const newData = ([...((prevDs?.data as number[]) || []), prob]).slice(-20);
        const newDataObj: ChartConfiguration<'line'>['data'] = {
            labels: newLabels,
            datasets: [{ data: newData, label: prevDs?.label || 'Goal Probability', fill: !!prevDs?.fill }]
        };

        this.lineChartData.set(newDataObj);
        this.lastProbMap[ev.id || label] = prob;

        // Force underlying chart to update
        try {
            this.chart?.update();
        } catch (e) {
            // ignore if chart not initialized yet
        }
    }
}
