import { Component, effect, input, InputSignal, model, ModelSignal, signal, WritableSignal } from "@angular/core";
import { MatSliderModule } from "@angular/material/slider";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";

@Component({
    selector: "category-price-filter",
    imports: [Input, Title, MatSliderModule],
    templateUrl: "./price-filter.html",
    styleUrl: "./price-filter.css"
})
export class PriceFilter {
    public minPriceValue: ModelSignal<number> = model.required<number>();
    public maxPriceValue: ModelSignal<number> = model.required<number>();

    public maxPrice: InputSignal<number> = input.required<number>();

    protected sliderMinPrice: WritableSignal<number> = signal<number>(0);
    protected sliderMaxPrice: WritableSignal<number> = signal<number>(100);

    constructor() {
        effect(() => {
            this.sliderMinPrice.set(100 - (this.maxPrice() - this.minPriceValue()) / this.maxPrice() * 100);
        });

        effect(() => {
            this.sliderMaxPrice.set(100 - (this.maxPrice() - this.maxPriceValue()) / this.maxPrice() * 100);
        });
    }

    protected onMinPriceChange(event: Event): void {
        const newValue: number = parseInt((event.target as HTMLInputElement).value);
        this.minPriceValue.set(Math.min(Math.ceil(newValue / 100 * this.maxPrice()), this.maxPriceValue() - 1));
    }

    protected onMaxPriceChange(event: Event): void {
        const newValue: number = parseInt((event.target as HTMLInputElement).value);
        this.maxPriceValue.set(Math.max(Math.ceil(newValue / 100 * this.maxPrice()), this.minPriceValue() + 1));
    }
}