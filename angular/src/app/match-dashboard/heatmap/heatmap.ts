import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as h337 from 'heatmap.js';

@Component({
    selector: 'app-heatmap',
    standalone: true,
    templateUrl: './heatmap.html',
    styleUrls: ['./heatmap.css']
})
export class Heatmap implements AfterViewInit {
    @ViewChild('heatmapContainer', { static: true }) container!: ElementRef;
    @ViewChild('pitchCanvas', { static: true }) pitchCanvas!: ElementRef<HTMLCanvasElement>;

    private heatmapInstance: any;

    ngAfterViewInit(): void {
        this.drawPitch();

        this.heatmapInstance = (h337 as any).create({
            container: this.container.nativeElement,
            radius: 40,
            maxOpacity: 0.7,
            minOpacity: 0,
            blur: 0.8
        });

        // Defensive runtime wrapper: some browser/runtime combos expose ImageData.data
        // as a read-only view. heatmap.js attempts to assign into the ImageData buffer
        // which can throw. Wrap the renderer's _colorize so we pass a writable copy
        // to the original implementation if needed.
        try {
            const renderer = this.heatmapInstance._renderer;
            if (renderer && typeof renderer._colorize === 'function') {
                const origColorize = renderer._colorize.bind(renderer);
                renderer._colorize = (imgData: ImageData, palette: any) => {
                    try {
                        return origColorize(imgData, palette);
                    } catch (err) {
                        // fallback: create a writable copy of the ImageData and run original on it
                        try {
                            const copied = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
                            const result = origColorize(copied, palette);
                            // attempt to blit the resulting ImageData to the renderer canvas
                            try {
                                const ctx = (renderer.canvas && (renderer.canvas.getContext as any)) ? renderer.canvas.getContext('2d') : (renderer._ctx || null);
                                if (ctx && copied) ctx.putImageData(copied, 0, 0);
                            } catch (blitErr) {
                                console.warn('heatmap: fallback blit failed', blitErr);
                            }
                            return result;
                        } catch (copyErr) {
                            console.error('heatmap: fallback colorize failed', copyErr);
                            return undefined;
                        }
                    }
                };
            }
        } catch (wrapErr) {
            console.warn('heatmap: could not wrap renderer._colorize', wrapErr);
        }
    }

    // Draw football pitch lines
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

    addPoint(team: string, x: number, y: number) {
        const rect = this.container.nativeElement.getBoundingClientRect();
        const px = ((x + 52) / 104) * rect.width;
        const py = ((34 - y) / 68) * rect.height;
        this.heatmapInstance.addData({
            x: Math.round(px),
            y: Math.round(py),
            value: team === 'Liverpool FC' ? 6 : 4
        });
    }
}
