import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-facs',
  imports: [],
  templateUrl: './facs.html',
  styleUrl: './facs.css',
})
export class Facs {
@ViewChild('factsModal') factsModal!: ElementRef<HTMLDialogElement>;

    openFacs() {
        this.factsModal.nativeElement.showModal();
    }

    close() {
        this.factsModal.nativeElement.close();
    }
}
