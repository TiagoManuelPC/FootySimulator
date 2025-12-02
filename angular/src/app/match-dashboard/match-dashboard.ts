import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatchEvent, SignalrService } from '../services/match-signalr.service';
import { DatePipe } from '@angular/common';
import { Heatmap } from './heatmap/heatmap';
import { PossessionChart } from './possession-chart/possession-chart';
import { GoalprobChart } from './goalprob-chart/goalprob-chart';

interface TeamStats {
    name: string;
    events: number;
    possessionSeconds: number;
}

@Component({
    selector: 'app-match-dashboard',
    templateUrl: './match-dashboard.html',
    styleUrls: ['./match-dashboard.css'],
    imports: [DatePipe, Heatmap, GoalprobChart, PossessionChart],
})
export class MatchDashboardComponent implements OnInit {
    @ViewChild(Heatmap) heatmap!: Heatmap;
    @ViewChild(PossessionChart) possessionChart!: PossessionChart;
    @ViewChild(GoalprobChart) goalProbChart!: GoalprobChart;

    events = signal<MatchEvent[]>([]);
    teams: { [k: string]: TeamStats } = {};

    constructor(private sr: SignalrService) { }

    ngOnInit(): void {
        // https://footysimulator.onrender.com/matchHub
        // this.sr.startConnection('https://localhost:5001/matchHub');
        this.sr.startConnection('https://footysimulator.onrender.com/matchHub'); // update url if needed
        this.sr.event$.subscribe(ev => this.onEvent(ev));
    }

    onEvent(ev: MatchEvent) {
        // push to feed
        this.events.update(events => [ev, ...events].slice(0, 200));

        // team stats
        if (!this.teams[ev.team]) this.teams[ev.team] = { name: ev.team, events: 0, possessionSeconds: 0 };
        this.teams[ev.team].events++;

        // simple possession time: if event is Possession or Pass, count small time to team
        if (ev.eventTypeString === 'Possession' || ev.eventTypeString === 'Pass' || ev.eventTypeString === 'Shot' || ev.eventTypeString === 'Goal') {
            this.teams[ev.team].possessionSeconds += 3; // heuristic: each such event ~3 seconds of possession
        } else {
            this.teams[ev.team].possessionSeconds += 1;
        }

        // update child widgets
        this.heatmap.addPoint(ev.team, ev.x, ev.y);
        if (ev.eventTypeString === 'Shot' || ev.eventTypeString === 'Goal') {
            // compute server-side goal probability if present, otherwise compute locally
            const prob = this.computeGoalProbability(ev);
            this.goalProbChart.pushPoint(ev, prob);
        }

        this.updatePossessionChart();
    }

    // Safe accessor used by templates to avoid optional/undefined template errors
    probFor(ev: MatchEvent): number | string {
        const key = ev.id ?? '';
        return this.goalProbChart?.lastProbMap?.[key] ?? '-';
    }

    private updatePossessionChart() {
        const totals = Object.values(this.teams).reduce((s, t) => s + t.possessionSeconds, 0) || 1;
        const labels = Object.keys(this.teams);
        const values = labels.map(l => Math.round((this.teams[l].possessionSeconds / totals) * 100));
        this.possessionChart.update(labels, values);
    }

    private computeGoalProbability(ev: MatchEvent): number {
        // simple local model: probability = clamp(0.02..0.6) based on distance to center of goal
        const goalX = ev.team === 'Team A' ? 52 : -52; // assume Team A attacks +X
        const dx = goalX - ev.x;
        const dy = ev.y; // approximate
        const dist = Math.sqrt(dx * dx + dy * dy);
        // map 0m->0.6, 25m->0.03, 40m->0.01
        const p = Math.max(0.01, Math.min(0.6, 0.6 * Math.exp(-0.1 * dist)));
        return Number(p.toFixed(3));
    }
}
