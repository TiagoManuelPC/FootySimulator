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

    // Wait for layout to stabilize
    requestAnimationFrame(() => {
      // Ensure container has a size
      const rect = this.container.nativeElement.getBoundingClientRect();
      this.container.nativeElement.style.width = rect.width + 'px';
      this.container.nativeElement.style.height = rect.height + 'px';

      // Create heatmap instance
      this.heatmapInstance = (h337 as any).create({
        container: this.container.nativeElement,
        renderer: 'canvas',   // force software renderer
        radius: 40,
        maxOpacity: 0.7,
        minOpacity: 0,
        blur: 0.8
      });

      // Force CPU-backed canvas (writable ImageData)
      const canvas = this.container.nativeElement.querySelector('canvas');
      canvas?.getContext('2d', { willReadFrequently: true });

      // Patch _colorize to never assign to read-only .data
      const renderer = this.heatmapInstance._renderer;
    //   renderer._colorize = function(imageData, gradient) {
    //     if (!imageData || !imageData.data) return;
    //     const data = imageData.data;
    //     for (let i = 0; i < data.length; i += 4) {
    //       const alpha = data[i + 3] * 4;
    //       const g = gradient[alpha];
    //       if (g) {
    //         data[i] = g[0];
    //         data[i + 1] = g[1];
    //         data[i + 2] = g[2];
    //       }
    //     }
    //   };

      // Ensure heatmap canvas matches container size
      this.heatmapInstance._renderer.setDimensions(rect.width, rect.height);
    });
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
        console.log(`Adding heatmap point for team ${team} at (${x}, ${y}) -> (${px}, ${py})`);
        this.heatmapInstance.addData({
            x: Math.round(px),
            y: Math.round(py),
            value: team === 'Liverpool FC' ? 6 : 4
        });
    }
}
