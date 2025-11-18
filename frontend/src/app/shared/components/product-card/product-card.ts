import { ProductsService } from '@shared/services/products.service';
import { Component, computed, inject, input, InputSignal, model, ModelSignal, Signal } from "@angular/core";
import { Button } from "../button/button";
import { ProductType } from "@shared/types/ProductType";
import { AvailabilityEnum } from "@shared/types/AvailabilityEnum";
import { RouterLink } from "@angular/router";
import { FormatProductNamePipe } from "@shared/pipes/format-product-name.pipe";
import { MessageService } from "@shared/services/message.service";
import { CartService } from "@shared/services/cart.service";
import { AuthService } from '@shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: "ui-product-card",
    imports: [Button, RouterLink, FormatProductNamePipe, CommonModule],
    templateUrl: "./product-card.html",
    styleUrl: "./product-card.css"
})
export class ProductCard {
    // public readonly type: InputSignal<"long" | "default"> = input<"long" | "default">("default");
    public readonly products: ModelSignal<ProductType[]> = model.required<ProductType[]>();
    public readonly productId: InputSignal<string> = input.required<string>();

    protected readonly product: Signal<ProductType> = computed<ProductType>(() => {
        return this.products().find((product: ProductType) => product.id === this.productId())!;
    });

    protected readonly productImageUrl: Signal<string> = computed<string>(() => {
        return this.product().image.length ? this.product().image[0] : "assets/product.png";
    });

    protected AvailabilityEnum = AvailabilityEnum;

    private messageService: MessageService = inject(MessageService);
    private authService: AuthService = inject(AuthService);
    private cartService: CartService = inject(CartService);
    private productsService: ProductsService = inject(ProductsService);

    protected toggleFavorite(): void {
        this.products.update(((products: ProductType[]) => {
            return products.map((product: ProductType) => {
                if (product.id === this.productId()) {
                    return { ...product, isFavorite: !product.isFavorite }
                }
                return product;
            });
        }));

        const newStatus: boolean = this.product().isFavorite;

        if (newStatus) {
            this.productsService.addProductToFavorites(this.product().id, !!this.authService.user());
        }
        else {
            this.productsService.removeProductFromFavorites(this.product().id, !!this.authService.user());
        }
    }

    protected buyProduct(): void {
        this.cartService.addToCart(this.product().id, !!this.authService.user())
            .then(() => {
                this.messageService.showMessageWithButton(
                    "success",
                    "Додано до кошика",
                    `Товар ${this.product().manufacturer} ${this.product()!.code} додано до кошика`,
                    "Перейти у кошик", ["cabinet", "shopping-cart"]
                )
            })
            .catch(() => {
                this.messageService.showMessage("error", "Помилка", "Не вдалося додати товар до кошика");
            });
    }

    protected discountedPrice(): number {
        return this.product()!.price * (1 - this.product()!.discount / 100);
    }
}
