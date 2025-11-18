import { Component, input, InputSignal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CategoryType } from "@shared/types/CategoryType";

@Component({
    selector: "ui-chips",
    imports: [RouterLink],
    templateUrl: "./chips.html",
    styleUrl: "./chips.css"
})
export class Chips {
    public readonly chips: InputSignal<CategoryType[]> = input<CategoryType[]>([]);
}