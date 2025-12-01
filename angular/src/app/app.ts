import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatchDashboardComponent } from "./match-dashboard/match-dashboard";
import { ThemeToggleComponent } from './theme-toggle/theme-toggle';
import { Facs } from '../facs/facs';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.css',
    imports: [MatchDashboardComponent, ThemeToggleComponent, Facs]
})

export class App {
    @ViewChild(Facs) facs!: Facs;

    openFacs() {
        this.facs.openFacs();
    }
}
