import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-theme-toggle',
    template: `
      <button (click)="toggle()" class="theme-toggle border-2 border-base" [attr.aria-pressed]="isDark" aria-label="Toggle theme">
        <!-- <span class="visually-hidden">Toggle theme</span> -->
        @if(isDark) {

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="size-6">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
            </svg>

        } @else {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="black" d="M21.64 13.02A9 9 0 1 1 10.98 2.36 7 7 0 0 0 21.64 13.02z"/>
            </svg>
        }
      </button>
    `,
    styles: [`
    .theme-toggle {
      background: transparent;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
    }
    .theme-toggle svg { width: 18px; height: 18px; display: inline-block; vertical-align: middle; }
  `],
    standalone: true,
    imports: [CommonModule]
})

export class ThemeToggleComponent implements OnInit {
    isDark = false;
    protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
    constructor() { }

    ngOnInit(): void {
        document.documentElement.setAttribute('data-theme', this.selectedTheme());
        this.isDark = localStorage.getItem('theme') === 'dark';
    }

    toggle() {
        this.isDark = !this.isDark;
        const theme = this.isDark ? 'dark' : 'light';
        this.selectedTheme.set(theme);
        localStorage.setItem('theme', theme);

        document.documentElement.setAttribute('data-theme', theme);
    }
}
