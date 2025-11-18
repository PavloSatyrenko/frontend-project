import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { ShopingCartProductType } from "@shared/types/ShopingCartProductType";
import { Title } from "@shared/components/title/title";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import { Button } from "@shared/components/button/button";
import { Range } from "@shared/components/range/range";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CartService } from "@shared/services/cart.service";
import { ProductsService } from "@shared/services/products.service";
import { AuthService } from "@shared/services/auth.service";
import { FormatProductNamePipe } from "@shared/pipes/format-product-name.pipe";
import { ProductType } from "@shared/types/ProductType";

@Component({
    selector: "cabinet-shoping-cart",
    imports: [Title, Checkbox, Button, Range, CommonModule, FormatProductNamePipe],
    templateUrl: "./shopping-cart.html",
    styleUrl: "./shopping-cart.css"
})
export class ShopingCart implements OnInit {
    protected cartItems: WritableSignal<ShopingCartProductType[]> = signal<ShopingCartProductType[]>([]);

    protected isAllProductsSelected: WritableSignal<boolean> = signal<boolean>(false);

    protected selectedAmount: WritableSignal<number> = signal<number>(0);

    protected readonly totalPrice: Signal<number> = computed<number>(() => {
        return this.cartItems().reduce((total: number, product: ShopingCartProductType) => {
            if (product.isChecked) {
                return total + product.totalPrice;
            }
            return total;
        }, 0);
    });

    protected readonly isOrderEmpty: Signal<boolean> = computed<boolean>(() => {
        return this.selectedAmount() === 0;
    });

    protected state: WritableSignal<"loading" | "loaded" | "no-results"> = signal<"loading" | "loaded" | "no-results">("loading");

    private updateTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private isInitialLoad: boolean = true;

    private cartService: CartService = inject(CartService);
    private authService: AuthService = inject(AuthService);
    private productsService: ProductsService = inject(ProductsService);

    constructor(private router: Router) {
        effect(() => {
            this.selectedAmount.set(this.cartItems().reduce((amount: number, cartItem: ShopingCartProductType) => {
                if (cartItem.isChecked) {
                    amount++;
                }
                return amount;
            }, 0));
        });

        effect(() => {
            if (this.selectedAmount() == this.cartItems().length) {
                this.isAllProductsSelected.set(true);
            }
            else {
                this.isAllProductsSelected.set(false);
            }
        });
    }

    ngOnInit(): void {
        this.state.set("loading");

        this.loadShoppingCart();
    }

    protected onProductSelect(cartItemId: string): void {
        this.cartItems.set([...this.cartItems()]);

        const cartItem: ShopingCartProductType | undefined = this.cartItems().find((item: ShopingCartProductType) => item.id == cartItemId);

        if (cartItem) {
            this.updateCartItem(cartItemId, cartItem.amount, cartItem.isChecked, cartItem.productId);
        }
    }

    protected onSelectAllChange(): void {
        if (this.isAllProductsSelected()) {
            this.cartItems.update((cartItems: ShopingCartProductType[]) => {
                return cartItems.map((cartItem: ShopingCartProductType) => ({ ...cartItem, isChecked: true }));
            });
        }
        else {
            this.cartItems.update((cartItems: ShopingCartProductType[]) => {
                return cartItems.map((cartItem: ShopingCartProductType) => ({ ...cartItem, isChecked: false }));
            });
        }

        this.cartService.toggleCartItemsSelection(this.isAllProductsSelected(), !!this.authService.user());
    }

    protected getProductImageUrl(product: ProductType): string {
        return product.image.length ? product.image[0] : "assets/product.png";
    }

    protected discountedPrice(product: ProductType): number {
        return product.price * (1 - product.discount / 100);
    }

    protected onProductsAmountChange(cartItem: ShopingCartProductType): void {
        this.cartItems.update((cartItems: ShopingCartProductType[]) => {
            return cartItems.map((tempCartItem: ShopingCartProductType) => {
                if (tempCartItem.id == cartItem.id) {
                    tempCartItem.amount = cartItem.amount;
                    tempCartItem.totalPrice = this.discountedPrice(cartItem.product) * tempCartItem.amount;
                }

                return tempCartItem;
            });
        });

        this.updateCartItem(cartItem.id, cartItem.amount, cartItem.isChecked, cartItem.productId);
    }

    protected toggleProductFavorite(cartItem: ShopingCartProductType): void {
        this.cartItems.update((cartItems: ShopingCartProductType[]) => {
            return cartItems.map((tempCartItem: ShopingCartProductType) => {
                if (tempCartItem.id == cartItem.id) {
                    tempCartItem.product.isFavorite = !tempCartItem.product.isFavorite;
                }

                return tempCartItem;
            });
        });

        const newStatus: boolean = cartItem.product.isFavorite;

        if (newStatus) {
            this.productsService.addProductToFavorites(cartItem.product.id, !!this.authService.user());
        }
        else {
            this.productsService.removeProductFromFavorites(cartItem.product.id, !!this.authService.user());
        }
    }

    protected onProductRemove(cartItem: ShopingCartProductType): void {
        this.cartItems.update((cartItems: ShopingCartProductType[]) => {
            return cartItems.filter((tempCartItem: ShopingCartProductType) => tempCartItem.id != cartItem.id);
        });

        this.cartService.removeFromCart(cartItem.id, cartItem.productId, !!this.authService.user())
            .then(() => {
                if (!this.cartItems().length) {
                    this.state.set("no-results");
                }
            });
    }

    protected createOrder(): void {
        this.router.navigate(["/order-create"]);
    }

    private async loadShoppingCart(): Promise<void> {
        this.cartService.getShoppingCart(!!this.authService.user())
            .then((cartItems: ShopingCartProductType[]) => {
                this.cartItems.set(cartItems);

                setTimeout(() => {
                    if (cartItems.length == 0) {
                        this.state.set("no-results");
                    }
                    else {
                        this.state.set("loaded");
                    }

                    this.isInitialLoad = false;
                }, 0);
            });
    }

    private updateCartItem(cartItemId: string, amount: number, isChecked: boolean, productId: string): void {
        if (this.isInitialLoad) {
            return;
        }

        if (this.updateTimeouts.has(cartItemId)) {
            clearTimeout(this.updateTimeouts.get(cartItemId));
        }

        const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
            this.cartService.updateCartItem(cartItemId, amount, isChecked, productId, !!this.authService.user());

            this.updateTimeouts.delete(cartItemId);
        }, 300);

        this.updateTimeouts.set(cartItemId, timeout);
    }
}
