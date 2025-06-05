import {
    Directive,
    HostListener,
    ElementRef,
    forwardRef
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor
} from '@angular/forms';

@Directive({
    selector: '[appPercentage]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PercentageDirective),
            multi: true
        }
    ]
})
export class PercentageDirective implements ControlValueAccessor {
    private onChange = (value: any) => { };
    private onTouched = () => { };

    constructor(private el: ElementRef<HTMLInputElement>) { }

    @HostListener('input', ['$event.target.value'])
    onInput(value: string) {
        let numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (numericValue > 100) numericValue = 100;
        this.onChange(numericValue);
        this.el.nativeElement.value = numericValue + '%';
    }

    @HostListener('blur')
    onBlur() {
        this.onTouched();
    }

    writeValue(value: any): void {
        if (value !== null && value !== undefined) {
            this.el.nativeElement.value = `${value}%`;
        } else {
            this.el.nativeElement.value = '';
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }
}
