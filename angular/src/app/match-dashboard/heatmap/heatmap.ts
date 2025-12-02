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

    private heat: ReturnType<typeof simpleheat> | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    // store points as normalized coords so they survive resize
    private normalizedPoints: Array<[number, number, number]> = [];

    ngAfterViewInit(): void {
        const wrapper = (this.container.nativeElement.parentElement || this.container.nativeElement) as HTMLElement;
        const canvas = this.pitchCanvas.nativeElement as HTMLCanvasElement;

        const setup = () => {
            const rect = wrapper.getBoundingClientRect();
            let w = Math.max(1, Math.round(rect.width));
            let h = Math.max(1, Math.round(rect.height));

            // fallback when layout not ready
            if (w < 50 || h < 50) {
                w = Math.max(300, Math.round(window.innerWidth));
                h = Math.max(200, Math.round(window.innerHeight));
            }

            // set CSS size and backing store (DPR-aware)
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            canvas.width = w * this.dpr;
            canvas.height = h * this.dpr;

            // initialize or re-init simpleheat
            this.heat = simpleheat(canvas);
            this.heat.radius(25 * this.dpr, 15 * this.dpr);

            // redraw heat and pitch
            this.redrawPoints();
            this.drawPitch();

            console.debug('heatmap setup', { w, h, backingW: canvas.width, backingH: canvas.height, dpr: this.dpr });
        };

        setup();

        this.resizeObserver = new ResizeObserver(() => {
            setup();
        });
        this.resizeObserver.observe(wrapper);

        // fallback
        const onWinResize = () => setup();
        window.addEventListener('resize', onWinResize);
        (this as any)._onWinResize = onWinResize;
    }

    private drawPitch() {
        const canvas = this.pitchCanvas.nativeElement as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bw = canvas.width; // backing-pixel coords
        const bh = canvas.height;

        // Clear before drawing (heat already drawn beneath)
        // We clear only the pitch layers by redrawing heat first then pitch.
        // Note: simpleheat.draw() overwrites the canvas, so ensure redraw order
        // is: heat -> pitch.

        // Draw pitch lines on top
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // use backing-pixel coords
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, 2 * this.dpr);
        ctx.clearRect(0, 0, bw, bh);

        // If there are heat points, redraw them first into the cleared canvas
        if (this.heat && this.normalizedPoints.length) {
            const pts: [number, number, number][] = this.normalizedPoints.map(p => [p[0] * bw, p[1] * bh, p[2]]);
            this.heat.clear();
            this.heat.data(pts).draw();
        }

        // Outer boundaries
        ctx.strokeRect(0, 0, bw, bh);

        // Halfway line
        ctx.beginPath();
        ctx.moveTo(bw / 2, 0);
        ctx.lineTo(bw / 2, bh);
        ctx.stroke();

        // Center circle
        const centerX = bw / 2;
        const centerY = bh / 2;
        const centerRadius = (bw / 9);
        ctx.beginPath();
        ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Penalty areas
        const penaltyWidth = bw / 6;
        const penaltyHeight = bh / 1.25;
        ctx.strokeRect(0, centerY - penaltyHeight / 2, penaltyWidth, penaltyHeight);
        ctx.strokeRect(bw - penaltyWidth, centerY - penaltyHeight / 2, penaltyWidth, penaltyHeight);

        const goalWidth = penaltyWidth / 2.5;
        const goalHeight = penaltyHeight / 3;
        ctx.strokeRect(0, centerY - goalHeight / 2, goalWidth, goalHeight);
        ctx.strokeRect(bw - goalWidth, centerY - goalHeight / 2, goalWidth, goalHeight);

        // Penalty spots (scaled appropriately)
        const spotRadius = Math.max(1, 3 * this.dpr);
        ctx.beginPath();
        ctx.arc(penaltyWidth - 80 * this.dpr, centerY, spotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bw - penaltyWidth + 80 * this.dpr, centerY, spotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if ((this as any)._onWinResize) {
            window.removeEventListener('resize', (this as any)._onWinResize);
            delete (this as any)._onWinResize;
        }
        this.heat = null;
    }

    addPoint(team: string, x: number, y: number) {
        const nx = ((x + 52) / 104);
        const ny = ((34 - y) / 68);
        const value = team === 'Liverpool FC' ? 6 : 4;
        this.normalizedPoints.push([nx, ny, value]);
        this.redrawPoints();
    }

    addRandomData(count = 500) {
        for (let i = 0; i < count; i++) {
            this.normalizedPoints.push([Math.random(), Math.random(), Math.random()]);
        }
        this.redrawPoints();
    }

    private redrawPoints() {
        const canvas = this.pitchCanvas.nativeElement as HTMLCanvasElement;
        if (!this.heat || !canvas) return;
        const bw = canvas.width;
        const bh = canvas.height;
        if (!this.normalizedPoints.length) {
            this.heat.clear();
            // still redraw pitch
            this.drawPitch();
            return;
        }
        const pts: [number, number, number][] = this.normalizedPoints.map(p => [p[0] * bw, p[1] * bh, p[2]]);
        this.heat.clear();
        this.heat.data(pts).draw();
        this.drawPitch();
    }

}



