import { Component, inject, input, InputSignal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { Link } from "@shared/components/link/link";
import { Title } from "@shared/components/title/title";
import { CategoryType } from "@shared/types/CategoryType";

type ExtendedCategoryType = CategoryType & {
    imageName: string | null;
    fragment: string | null;
};

@Component({
    selector: "main-categories",
    imports: [Button, Title, Link, RouterLink],
    templateUrl: "./categories.html",
    styleUrl: "./categories.css",
})
export class Categories {
    public readonly categories: InputSignal<ExtendedCategoryType[]> = input<ExtendedCategoryType[]>([]);

    private router: Router = inject(Router);

    protected viewAllSubcategories(id: string): void {
        this.router.navigate(["category", id]);
    }

    protected scrollToCategory(categoryFragment: string | null): void {
        if (categoryFragment) {
            this.router.navigate(["category"], { fragment: categoryFragment });
        }
    }
}
