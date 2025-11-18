import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { Logo } from "@shared/components/logo/logo";
import { CategoryType } from "@shared/types/CategoryType";
import { Link } from "@shared/components/link/link";
import { Sidebar } from "@components/header/sidebar/sidebar";
import { CategoriesService } from "@shared/services/categories.service";
import { CommonModule } from "@angular/common";
import { Search } from "./search/search";
import { CartService } from "@shared/services/cart.service";

@Component({
    selector: "app-header",
    imports: [Button, Logo, RouterLink, Link, Sidebar, CommonModule, Search],
    templateUrl: "./header.html",
    styleUrl: "./header.css"
})
export class Header implements OnInit {
    protected categories: WritableSignal<Omit<CategoryType, "subcategories">[]> = signal<Omit<CategoryType, "subcategories">[]>([]);

    protected cartItemCount: Signal<number> = computed<number>(() => this.cartService.cartItemsCount());

    private categoriesService: CategoriesService = inject(CategoriesService);
    private cartService: CartService = inject(CartService);
    private router: Router = inject(Router);

    public ngOnInit(): void {
        this.loadCategories();
    }

    private loadCategories(): void {
        this.categoriesService.getCategories(9)
            .then((categories: CategoryType[]) => {
                this.categories.set(categories);
            });
    }

    protected scrollToVin(): void {
        const vinBlock = document.getElementById("vinBlock");
        if (vinBlock) {
            vinBlock.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        else {
            this.router.navigate(["/"], { fragment: "vin-block" });
        }
    }
}