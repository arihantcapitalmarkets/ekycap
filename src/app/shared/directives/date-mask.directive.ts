import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDateMask]',
  standalone: true, // This makes the directive standalone
})
export class DateMaskDirective {
  @Input() maxNumericLength: number | undefined; // Input to define max length

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

    // Apply DD/MM/YYYY format
    if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5)}`;

    if (this.maxNumericLength && input.value.length > this.maxNumericLength) {
      input.value = input.value.slice(0, this.maxNumericLength);
    }

    input.value = value;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow: Backspace, Delete, Tab, Escape, Enter, and navigation keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) {
      return; // Allow default behavior
    }

    // Prevent input if not a number or exceeds max length
    const input = event.target as HTMLInputElement;
    if (
      event.key &&
      (!/^[0-9]$/.test(event.key) ||
        (this.maxNumericLength && input.value.length >= this.maxNumericLength))
    ) {
      event.preventDefault();
    }
  }

}
