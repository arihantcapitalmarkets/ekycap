import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, EventEmitter, Output, Input } from '@angular/core';
import SignaturePad from 'signature_pad';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss'
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private signaturePad!: SignaturePad;
  @Output() messageEvent = new EventEmitter<string>();
  @Output() clear = new EventEmitter<string>();
  @Input() height: number | string;
  @Input() width: number | string;

  constructor(public global: GlobalService) {

  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)'
    });
    // const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Number(this.width);
    canvas.height = Number(this.height);
    canvas.getContext('2d')!.scale(1, 1);
    this.signaturePad.clear();

    this.resizeCanvas();
    // setTimeout(() => {

    // Event listeners for buttons
    this.setupEventListeners();
    // }, 1000);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    // console.log('window.devicePixelRatio', window.devicePixelRatio);
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    this.height = Number(this.height) + 40;
    this.width = Number(this.width) + 40;
    // canvas.width = canvas.offsetWidth * ratio;
    // canvas.height = canvas.offsetHeight * ratio;
    canvas.width = Number(this.width);
    canvas.height = Number(this.height);
    canvas.getContext('2d')!.scale(1, 1);
    // this.signaturePad = new SignaturePad(canvas, {
    //   backgroundColor: 'rgb(255, 255, 255)'
    // });
    this.signaturePad.clear();
  }

  private setupEventListeners(): void {
    // if (this.canvasRef.nativeElement) {
    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Number(this.width);
    canvas.height = Number(this.height);
    // canvas.getContext('2d')!.scale(ratio, ratio);
    // this.signaturePad = new SignaturePad(canvas, {
    //   backgroundColor: 'rgb(255, 255, 255)'
    // });
    this.signaturePad.clear();
    if (this.global.isMobileDevice) {
      console.warn("Mobile device found");
    }
    // setTimeout(() => {
    //   this.onResize();
    // }, 1000);
    // }

    const clearButton = document.querySelector("[data-action=clear]") as HTMLElement;
    const saveJPGButton = document.querySelector("[data-action=save-jpg]") as HTMLElement;
    // const undoButton = document.querySelector("[data-action=undo]") as HTMLElement;
    // const changeColorButton = document.querySelector("[data-action=change-color]") as HTMLElement;
    // const savePNGButton = document.querySelector("[data-action=save-png]") as HTMLElement;
    // const saveSVGButton = document.querySelector("[data-action=save-svg]") as HTMLElement;

    clearButton.addEventListener("click", () => this.signaturePad.clear());
    saveJPGButton.addEventListener("click", () => this.saveSignature('image/jpeg', 'signature.jpg'));
    // undoButton.addEventListener("click", () => this.undo());
    // changeColorButton.addEventListener("click", () => this.changeColor());
    // savePNGButton.addEventListener("click", () => this.saveSignature('image/png', 'signature.png'));
    // saveSVGButton.addEventListener("click", () => this.saveSignature('image/svg+xml', 'signature.svg'));
  }

  private undo(): void {
    const data = this.signaturePad.toData();
    if (data) {
      data.pop();
      this.signaturePad.fromData(data);
    }
  }

  private changeColor(): void {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    const color = `rgb(${r},${g},${b})`;
    this.signaturePad.penColor = color;
  }

  private saveSignature(format: string, filename: string): void {
    if (this.signaturePad.isEmpty()) {
      alert("Please provide a signature first.");
    } else {
      const dataURL = this.signaturePad.toDataURL(format);
      this.download(dataURL, filename);
    }
  }

  private download(dataURL: string, filename: string): void {
    console.log('dataURL', dataURL);
    this.messageEvent.emit(dataURL);
    return;
    const blob = this.dataURLToBlob(dataURL);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}
