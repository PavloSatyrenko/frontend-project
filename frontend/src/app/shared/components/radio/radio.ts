import { Component, input, InputSignal, model, ModelSignal, output, OutputEmitterRef } from '@angular/core';

@Component({
    selector: 'ui-radio',
    imports: [],
    templateUrl: './radio.html',
    styleUrl: './radio.css'
})
export class Radio {
    public readonly value: InputSignal<any> = input<any>();
    public readonly checkedValue: InputSignal<any> = input<any>("");
    public readonly label: InputSignal<string> = input<string>("");
    public readonly name: InputSignal<string> = input<string>("");
    public isDisabled: InputSignal<boolean> = input<boolean>(false);

    public readonly valueChange: OutputEmitterRef<any> = output<any>();

    protected onChange(event: Event): void {
        const newValue = this.checkedValue();
        event.preventDefault();
        event.stopPropagation();
        this.valueChange.emit(newValue);
    }

    protected isCheked(): boolean {
        return this.value() === this.checkedValue();
    }
}
