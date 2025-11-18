import { Component, effect, inject, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { ProductCard } from "@shared/components/product-card/product-card";
import { Select } from "@shared/components/select/select";
import { Title } from "@shared/components/title/title";
import { AuthService } from "@shared/services/auth.service";
import { CartService } from "@shared/services/cart.service";
import { MessageService } from "@shared/services/message.service";
import { ProductsService } from "@shared/services/products.service";
import { AvailabilityEnum } from "@shared/types/AvailabilityEnum";
import { ProductType } from "@shared/types/ProductType";

@Component({
    selector: "cabinet-favorites",
    imports: [Title, ProductCard, Button, Select],
    templateUrl: "./favorites.html",
    styleUrl: "./favorites.css",
})
export class Favorites {
    protected products: WritableSignal<ProductType[]> = signal<ProductType[]>([]);

    protected sortValue: WritableSignal<"nameAsc" | "nameDesc" | "priceAsc" | "priceDesc"> = signal<
        "nameAsc" | "nameDesc" | "priceAsc" | "priceDesc"
    >("nameAsc");

    private productsService: ProductsService = inject(ProductsService);
    private cartService: CartService = inject(CartService);
    private authService: AuthService = inject(AuthService);
    private messageService: MessageService = inject(MessageService);

    constructor() {
        effect(() => {
            const sortValue: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc" = this.sortValue();

            localStorage.setItem("favoriteProductsSortingValue", sortValue);
        });
    }

    ngOnInit(): void {
        this.sortValue.set(
            (localStorage.getItem("favoriteProductsSortingValue") as
                | "priceAsc"
                | "priceDesc"
                | "nameAsc"
                | "nameDesc") || "nameAsc"
        );

        this.loadFavoriteProducts();
    }

    private async loadFavoriteProducts(): Promise<void> {
        this.productsService
            .getFavoriteProducts(this.sortValue(), !!this.authService.user())
            .then((response: ProductType[] | { message: string }) => {
                if ("message" in response) {
                    return;
                }

                this.products.set(response);
            });
    }

    protected sortFavoriteProducts(): void {
        this.loadFavoriteProducts();
    }

    protected buyAllFavorites(): void {
        const availableProducts = this.products().filter(
            (product: ProductType) => product.availability == AvailabilityEnum.Available
        );

        if (!availableProducts.length) {
            return;
        }

        this.cartService.addAllProductsToCart(availableProducts, !!this.authService.user()).then(() => {
            this.messageService.showMessageWithButton(
                "success",
                "Успіх",
                "Усі товари успішно додано до кошика",
                "Перейти у кошик",
                ["cabinet", "shopping-cart"]
            );
        });
    }
}
