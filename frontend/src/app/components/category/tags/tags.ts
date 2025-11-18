import { Component, model, ModelSignal } from "@angular/core";
import { FilterValueType } from "@shared/types/FilterValueType";
import { Button } from "@shared/components/button/button";

@Component({
    selector: "category-tags",
    imports: [Button],
    templateUrl: "./tags.html",
    styleUrl: "./tags.css"
})
export class Tags {
    public readonly tags: ModelSignal<FilterValueType[]> = model<FilterValueType[]>([]);

    protected removeTag(tag: FilterValueType): void {
        this.tags.update(() => this.tags()?.filter((tagTemporary: FilterValueType) => tagTemporary != tag));
    }

    protected clearTags(): void {
        this.tags.set([]);
    }
}