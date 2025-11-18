import { Component, computed, effect, input, InputSignal, model, ModelSignal, output, OutputEmitterRef, Signal } from "@angular/core";
import { Input } from "../input/input";
import { Button } from "../button/button";

@Component({
    selector: "ui-range",
    imports: [Input, Button],
    templateUrl: "./range.html",
    styleUrl: "./range.css"
})
export class Range {
    public readonly minNumber: InputSignal<number> = input<number>(0);
    public readonly maxNumber: InputSignal<number> = input<number>(Infinity);
    public isDisabled: InputSignal<boolean> = input<boolean>(false);

    protected isIncreaseButtonDisabled: Signal<boolean> = computed<boolean>(() => {
        return this.isDisabled() || this.value() >= this.maxNumber();
    });

    protected isDecreaseButtonDisabled: Signal<boolean> = computed<boolean>(() => {
        return this.isDisabled() || this.value() <= this.minNumber();
    });

    public value: ModelSignal<number> = model<number>(0);

    public readonly change: OutputEmitterRef<number> = output<number>();

    constructor() {
        effect(() => {
            this.change.emit(this.value());
        });
    }

    protected decreaseValue(): void {
        if (this.value() > this.minNumber()) {
            this.value.set(this.value() - 1);
        }
    }

    protected increaseValue(): void {
        if (this.value() < this.maxNumber()) {
            this.value.set(this.value() + 1);
        }
    }
}