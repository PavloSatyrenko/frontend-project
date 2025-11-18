import {
    Component,
    computed,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    Signal,
    signal,
    viewChild,
    WritableSignal,
} from "@angular/core";
import { Button } from "@shared/components/button/button";
import { ProductCard } from "@shared/components/product-card/product-card";
import { Title } from "@shared/components/title/title";
import { AvailabilityEnum } from "@shared/types/AvailabilityEnum";
import { ProductType } from "@shared/types/ProductType";
import { ActivatedRoute, Params } from "@angular/router";
import { FormatProductNamePipe } from "@shared/pipes/format-product-name.pipe";
import { MessageService } from "@shared/services/message.service";
import { CartService } from "@shared/services/cart.service";
import { ProductsService } from "@shared/services/products.service";
import { AuthService } from "@shared/services/auth.service";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";

@Component({
    selector: "page-product",
    imports: [Button, Title, ProductCard, FormatProductNamePipe, CommonModule],
    templateUrl: "./product.html",
    styleUrl: "./product.css",
})
export class Product implements OnInit, OnDestroy {
    protected AvailabilityEnum = AvailabilityEnum;

    protected productId: string = "";
    protected product: WritableSignal<ProductType | null> = signal<ProductType | null>(null);

    protected isProductLengthMoreThanOne: Signal<boolean> = computed<boolean>(() => {
        const product: ProductType | null = this.product();
        return product ? product.image.length > 1 : false;
    });

    protected selectedImage: WritableSignal<string> = signal<string>("");

    protected productImageUrl: Signal<string> = computed<string>(() => {
        const product: ProductType | null = this.product();

        return product?.image.length ? this.selectedImage() : "assets/product.png";
    });

    protected recommended: WritableSignal<ProductType[]> = signal([]);

    protected productsList: Signal<ElementRef<HTMLDivElement>> =
        viewChild.required<ElementRef<HTMLDivElement>>("productsList");

    private subscription: Subscription | null = null;

    private messageService: MessageService = inject(MessageService);
    private cartService: CartService = inject(CartService);
    private authService: AuthService = inject(AuthService);
    private productsService: ProductsService = inject(ProductsService);
    private route: ActivatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        this.subscription = this.route.params.subscribe((params: Params) => {
            this.productId = params["productId"];

            this.productsService.getProductById(this.productId).then((product: ProductType) => {
                this.product.set(product);

                if (product.image.length) {
                    this.selectedImage.set(product.image[0]);
                }
            });

            this.recommended.set([]);

            this.productsService
                .getProductAnalogs(this.productId)
                .then((response: ProductType[] | { message: string }) => {
                    if (!("message" in response)) {
                        this.recommended.update((products: ProductType[]) => [...response, ...products]);

                        setTimeout(() => {
                            if (this.productsList()) {
                                this.productsList().nativeElement.scroll({ left: 0, behavior: "smooth" });
                            }
                        }, 100);
                    }
                });

            this.productsService
                .getProductRecommendations()
                .then((response: ProductType[] | { message: string }) => {
                    if (!("message" in response)) {
                        this.recommended.update((products: ProductType[]) => {
                            let recommendedProducts = response.filter((product: ProductType) => {
                                return (
                                    !this.recommended().some((rec: ProductType) => rec.id == product.id) &&
                                    product.id !== this.productId
                                );
                            });

                            return [...products, ...recommendedProducts];
                        });
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

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected selectImage(imageUrl: string): void {
        this.selectedImage.set(imageUrl);
    }

    protected toggleFavorite(): void {
        this.product.update((product: ProductType | null) => ({
            ...product!,
            isFavorite: !product!.isFavorite,
        }));

        const newStatus: boolean = this.product()!.isFavorite;

        if (newStatus) {
            this.productsService.addProductToFavorites(this.productId, !!this.authService.user());
        } else {
            this.productsService.removeProductFromFavorites(this.productId, !!this.authService.user());
        }
    }

    protected buyProduct(): void {
        this.cartService
            .addToCart(this.productId, !!this.authService.user())
            .then(() => {
                this.messageService.showMessageWithButton(
                    "success",
                    "Додано до кошика",
                    `Товар ${this.product()!.manufacturer} ${this.product()!.code} додано до кошика`,
                    "Перейти у кошик",
                    ["cabinet", "shopping-cart"]
                );
            })
            .catch(() => {
                this.messageService.showMessage("error", "Помилка", "Не вдалося додати товар до кошика");
            });
    }

    protected scrollProductsList(direction: "left" | "right"): void {
        if (direction === "left") {
            this.productsList().nativeElement.scrollBy({ left: -1, behavior: "smooth" });
        } else {
            this.productsList().nativeElement.scrollBy({ left: 1, behavior: "smooth" });
        }
    }

    protected discountedPrice(): number {
        return this.product()!.price * (1 - this.product()!.discount / 100);
    }
}
