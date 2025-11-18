import { Component, ElementRef, inject, OnInit, signal, viewChild, WritableSignal, Signal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { ProductCard } from "@shared/components/product-card/product-card";
import { ProductType } from "@shared/types/ProductType";
import { Gallery } from "@components/main/gallery/gallery";
import { CategoryType } from "@shared/types/CategoryType";
import { Categories } from "@components/main/categories/categories";
import { VinSearch } from "@components/main/vin-search/vin-search";
import { CategoriesService } from "@shared/services/categories.service";
import { MessageService } from "@shared/services/message.service";
import { Button } from "@shared/components/button/button";
import { Router } from "@angular/router";
import { ProductsService } from "@shared/services/products.service";

type ExtendedCategoryType = CategoryType & {
    imageName: string | null;
    fragment: string | null;
};

@Component({
    selector: "page-main",
    imports: [Title, ProductCard, Gallery, Categories, VinSearch, Button],
    templateUrl: "./main.html",
    styleUrl: "./main.css",
})
export class Main implements OnInit {
    protected products: WritableSignal<ProductType[]> = signal([]);

    protected categories: WritableSignal<ExtendedCategoryType[]> = signal<ExtendedCategoryType[]>([]);

    protected productsList: Signal<ElementRef<HTMLDivElement>> =
        viewChild.required<ElementRef<HTMLDivElement>>("productsList");

    protected vinBlock: Signal<ElementRef<HTMLDivElement>> = viewChild.required<ElementRef<HTMLDivElement>>("vinBlock");

    private categoriesService: CategoriesService = inject(CategoriesService);
    private messageService: MessageService = inject(MessageService);
    private productsService: ProductsService = inject(ProductsService);
    private router: Router = inject(Router);

    ngOnInit(): void {
        this.categoriesService
            .getAllCategories()
            .then((categories: CategoryType[]) => {
                this.categories.set(
                    categories.map((category: CategoryType) => {
                        const updatedCategory: ExtendedCategoryType = {
                            ...category,
                            imageName: null,
                            fragment: null,
                        };

                        switch (updatedCategory.name) {
                            case "Аксесуари":
                                updatedCategory.imageName = "category accessories";
                                updatedCategory.fragment = "accessories";
                                break;

                            case "Інструменти":
                                updatedCategory.imageName = "category tools";
                                updatedCategory.fragment = "tools";
                                break;

                            case "Акумулятори":
                                updatedCategory.imageName = "category acum";
                                updatedCategory.fragment = "accumulators";
                                break;

                            case "Олива":
                                updatedCategory.imageName = "category oil";
                                updatedCategory.fragment = "oils";
                                break;

                            case "Спеціальні рідини":
                                updatedCategory.imageName = "category liquids";
                                updatedCategory.fragment = "liquids";
                                break;

                            case "Автохімія":
                                updatedCategory.imageName = "category chemics";
                                updatedCategory.fragment = "chemicals";
                                break;

                            default:
                                break;
                        }

                        return updatedCategory;
                    })
                );
            })
            .catch((error) => {
                console.error(error);
                this.messageService.showMessage(
                    "error",
                    "Помилка",
                    `Помилка: ${error.error.message ?? error.statusText}`
                );
            })
            .finally(() => {
                if (this.router.url.includes("/#vin-block")) {
                    setTimeout(() => {
                        this.vinBlock().nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 100);
                }
            });

        this.productsService
            .getProductRecommendations()
            .then((response: ProductType[] | { message: string }) => {
                if (!("message" in response)) {
                    this.products.set(response);
                }
            })
            .catch((error) => {
                console.error(error);
                this.messageService.showMessage(
                    "error",
                    "Помилка",
                    `Помилка: ${error.error.message ?? error.statusText}`
                );
            });
    }

    protected scrollProductsList(direction: "left" | "right"): void {
        if (direction === "left") {
            this.productsList().nativeElement.scrollBy({ left: -1, behavior: "smooth" });
        } else {
            this.productsList().nativeElement.scrollBy({ left: 1, behavior: "smooth" });
        }
    }
}
