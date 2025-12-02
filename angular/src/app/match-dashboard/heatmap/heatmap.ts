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

        // Defensive runtime wrapper: some environments expose ImageData.data as
        // a read-only view. heatmap.js may attempt to write into that buffer
        // and throw. Wrap the renderer's _colorize to validate inputs and
        // provide a writable copy fallback.
        try {
            const renderer = this.heatmapInstance._renderer;
            if (renderer && typeof renderer._colorize === 'function') {
                const origColorize = renderer._colorize.bind(renderer);
                renderer._colorize = (imgData: ImageData | undefined, palette: any) => {
                    // If imgData is undefined, try to synthesize one from the renderer's canvas
                    let workingImg: ImageData | undefined = imgData;
                    if (!workingImg) {
                        try {
                            let ctx: CanvasRenderingContext2D | null = null as any;
                            if (renderer.canvas && typeof (renderer.canvas.getContext) === 'function') {
                                ctx = renderer.canvas.getContext('2d');
                            } else if ((renderer as any)._ctx) {
                                ctx = (renderer as any)._ctx as CanvasRenderingContext2D;
                            } else if ((renderer as any).canvas && (renderer as any).canvas.ctx) {
                                ctx = (renderer as any).canvas.ctx as CanvasRenderingContext2D;
                            }

                            if (ctx) {
                                const w = (renderer.canvas && (renderer.canvas.width || (renderer.canvas as any).offsetWidth)) || (ctx.canvas ? ctx.canvas.width : 0) || 1;
                                const h = (renderer.canvas && (renderer.canvas.height || (renderer.canvas as any).offsetHeight)) || (ctx.canvas ? ctx.canvas.height : 0) || 1;
                                try {
                                    // try to read existing pixels
                                    workingImg = ctx.getImageData(0, 0, Math.max(1, w), Math.max(1, h));
                                } catch (getErr) {
                                    // canvas may be tainted or empty — create an empty ImageData
                                    workingImg = new ImageData(Math.max(1, w), Math.max(1, h));
                                }
                            } else {
                                // No context available; create a minimal ImageData
                                workingImg = new ImageData(1, 1);
                            }
                        } catch (synthErr) {
                            console.warn('heatmap: could not synthesize ImageData, creating minimal placeholder', synthErr);
                            workingImg = new ImageData(1, 1);
                        }
                    }

                    if (!workingImg || !workingImg.data) {
                        console.warn('heatmap: no usable ImageData for colorize', workingImg);
                        return;
                    }

                    try {
                        return origColorize(workingImg, palette);
                    } catch (err) {
                        // Make a writable copy and retry
                        try {
                            const src = workingImg.data;
                            const copyArr = new Uint8ClampedArray(src.length);
                            copyArr.set(src);
                            const copied = new ImageData(copyArr, workingImg.width, workingImg.height);
                            const result = origColorize(copied, palette);

                            // Try to blit the copied result back to a canvas context
                            try {
                                let ctx: CanvasRenderingContext2D | null = null as any;
                                if (renderer.canvas && typeof (renderer.canvas.getContext) === 'function') {
                                    ctx = renderer.canvas.getContext('2d');
                                } else if ((renderer as any)._ctx) {
                                    ctx = (renderer as any)._ctx as CanvasRenderingContext2D;
                                } else if ((renderer as any).canvas && (renderer as any).canvas.ctx) {
                                    ctx = (renderer as any).canvas.ctx as CanvasRenderingContext2D;
                                }

                                if (ctx && copied) {
                                    try { ctx.putImageData(copied, 0, 0); } catch (blitErr) { console.warn('heatmap: fallback blit failed', blitErr); }
                                }
                            } catch (ctxErr) {
                                console.warn('heatmap: could not blit fallback image', ctxErr);
                            }

                            return result;
                        } catch (copyErr) {
                            console.error('heatmap: fallback colorize failed', copyErr);
                            return;
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
