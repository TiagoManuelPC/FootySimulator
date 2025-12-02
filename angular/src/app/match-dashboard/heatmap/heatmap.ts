import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import simpleheat from 'simpleheat';

@Component({
    selector: 'app-heatmap',
    templateUrl: `./heatmap.html`,
    styleUrls: ['./heatmap.css'],
})
export class Heatmap implements AfterViewInit, OnDestroy {
    @ViewChild('heatmapContainer', { static: true }) container!: ElementRef<HTMLDivElement>;
    @ViewChild('pitchCanvas', { static: true }) pitchCanvas!: ElementRef<HTMLCanvasElement>;
    private heat!: ReturnType<typeof simpleheat> | null;
    private canvas!: HTMLCanvasElement | null;
    private resizeObserver: ResizeObserver | null = null;
    private dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    ngAfterViewInit(): void {
        this.drawPitch();
        const containerEl = this.container.nativeElement;

        // create an explicit canvas so we control sizing and DPR handling
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.inset = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        containerEl.appendChild(this.canvas);

        const setup = () => {
            const rect = containerEl.getBoundingClientRect();
            let layoutW = Math.max(1, Math.round(rect.width));
            let layoutH = Math.max(1, Math.round(rect.height));

            // defensive fallback when parent hasn't laid out yet
            if (layoutW < 50 || layoutH < 50) {
                layoutW = Math.max(300, Math.round(window.innerWidth));
                layoutH = Math.max(200, Math.round(window.innerHeight));
            }

            // set CSS size and backing store for DPR
            this.canvas!.style.width = `${layoutW}px`;
            this.canvas!.style.height = `${layoutH}px`;
            this.canvas!.width = layoutW * this.dpr;
            this.canvas!.height = layoutH * this.dpr;

            const ctx = this.canvas!.getContext('2d');
            if (ctx) ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            // initialize simpleheat with a DPR-aware radius
            this.heat = simpleheat(this.canvas as HTMLCanvasElement);
            this.heat.radius(25 * this.dpr, 15 * this.dpr);
            this.heat.clear();
        };

        setup();

        // watch for container size changes
        this.resizeObserver = new ResizeObserver(() => {
            setup();
            // redraw any existing data if desired
        });
        this.resizeObserver.observe(containerEl);
    }

    //     // Draw football pitch lines
    private drawPitch() {
        const canvas = this.pitchCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const w = canvas.width;
        const h = canvas.height;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // Outer boundaries
        ctx.strokeRect(0, 0, w, h);

        // Halfway line
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();

        // Center circle
        const centerX = w / 2;
        const centerY = h / 2;
        const centerRadius = (w / 9); // approximate size
        ctx.beginPath();
        ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Penalty areas
        const penaltyWidth = w / 6;
        const penaltyHeight = h / 1.25;

        // Left penalty
        ctx.strokeRect(0, centerY - penaltyHeight / 2, penaltyWidth, penaltyHeight);

        // Right penalty
        ctx.strokeRect(w - penaltyWidth, centerY - penaltyHeight / 2, penaltyWidth, penaltyHeight);

        // Goal areas (smaller inside penalty)
        const goalWidth = penaltyWidth / 2.5;
        const goalHeight = penaltyHeight / 3;

        // Left goal area
        ctx.strokeRect(0, centerY - goalHeight / 2, goalWidth, goalHeight);

        // Right goal area
        ctx.strokeRect(w - goalWidth, centerY - goalHeight / 2, goalWidth, goalHeight);

        // Penalty spots
        ctx.beginPath();
        ctx.arc(penaltyWidth - 80, centerY, 3, 0, Math.PI * 2); // left
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(w - penaltyWidth + 80, centerY, 3, 0, Math.PI * 2); // right
        ctx.fill();
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.heat = null;
        this.canvas = null;
    }

    addPoint(team: string, x: number, y: number) {
        // map your logical pitch coords to canvas backing buffer coordinates
        if (!this.canvas || !this.heat) return;
        const bw = this.canvas.width;
        const bh = this.canvas.height;

        // Example mapping — adapt to your pitch coordinate system
        const px = ((x + 52) / 104) * bw;
        const py = ((34 - y) / 68) * bh;
        const value = team === 'Liverpool FC' ? 6 : 4;
        this.heat.add([px, py, value]);
        this.heat.draw();
    }

}



