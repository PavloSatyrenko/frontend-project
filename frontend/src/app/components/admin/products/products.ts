import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import { Input } from "@shared/components/input/input";
import { Pagination } from "@shared/components/pagination/pagination";
import { Select } from "@shared/components/select/select";
import { Title } from "@shared/components/title/title";
import { FormatProductNamePipe } from "@shared/pipes/format-product-name.pipe";
import { MessageService } from "@shared/services/message.service";
import { ProductsService } from "@shared/services/products.service";
import { AvailabilityEnum } from "@shared/types/AvailabilityEnum";
import { ProductsRequestType } from "@shared/types/ProductsRequestType";
import { ProductsResponseType } from "@shared/types/ProductsResponseType";
import { ProductType } from "@shared/types/ProductType";

type AdminProductType = ProductType & { discount: number };

@Component({
    selector: "admin-products",
    imports: [Input, Button, Select, CommonModule, FormatProductNamePipe, Pagination, Title, Checkbox],
    templateUrl: "./products.html",
    styleUrl: "./products.css"
})
export class Products implements OnInit {
    protected products: WritableSignal<AdminProductType[]> = signal([]);

    protected searchValue: WritableSignal<string> = signal("");
    protected selectedAvailability: WritableSignal<AvailabilityEnum | "ALL"> = signal("ALL");
    protected selectedDiscountMode: WritableSignal<"Зі знижкою" | "Без знижки" | "ALL"> = signal("ALL");

    protected totalPages: WritableSignal<number> = signal<number>(0);

    protected readonly AvailabilityEnum = AvailabilityEnum;

    protected state: WritableSignal<"loading" | "loaded" | "no-results"> = signal<"loading" | "loaded" | "no-results">("loading");
    protected selectedSortingValue: WritableSignal<"priceAsc" | "priceDesc" | "nameAsc" | "nameDesc"> = signal<"priceAsc" | "priceDesc" | "nameAsc" | "nameDesc">("nameAsc");

    protected isEditingProduct: WritableSignal<boolean> = signal(false);
    protected isPopupSaveButtonDisabled: WritableSignal<boolean> = signal(false);

    protected editingProductId: WritableSignal<string> = signal("");
    protected discountValue: WritableSignal<number> = signal(0);
    protected isRecommendedValue: WritableSignal<boolean> = signal(false);
    protected analogsValue: WritableSignal<ProductType[]> = signal([]);
    protected analogsAmount: Signal<number> = computed(() => this.analogsValue().length);

    protected analogsSearchValue: WritableSignal<string> = signal("");
    protected analogsState: WritableSignal<"loading" | "enter" | "loaded" | "no-results"> = signal<"loading" | "enter" | "loaded" | "no-results">("enter");
    protected analogsSearchResult: WritableSignal<ProductType[]> = signal([]);

    private analogDebounceTimeout: ReturnType<typeof setTimeout> | null = null;

    private productsService: ProductsService = inject(ProductsService);
    private messageService: MessageService = inject(MessageService);

    constructor() {
        effect(() => {
            this.productsService.productsRequest.update((request: ProductsRequestType) => {
                const selectedAvailability: AvailabilityEnum | "ALL" = this.selectedAvailability();

                if (selectedAvailability === "ALL") {
                    const { availability, ...productsRequest } = request;
                    return productsRequest;
                }

                return {
                    ...request,
                    availability: [selectedAvailability],
                };
            });
        });

        effect(() => {
            this.productsService.productsRequest.update((request: ProductsRequestType) => {
                const selectedDiscount: "Зі знижкою" | "Без знижки" | "ALL" = this.selectedDiscountMode();

                if (selectedDiscount === "ALL") {
                    const { discounts, ...productsRequest } = request;
                    return productsRequest;
                }

                return {
                    ...request,
                    discounts: [selectedDiscount],
                };
            });
        });

        effect(() => {
            const sortValue: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc" = this.selectedSortingValue();

            localStorage.setItem("adminProductsSortingValue", sortValue);

            this.productsService.productsRequest.update((request: ProductsRequestType) => {
                return {
                    ...request,
                    sort: sortValue,
                };
            });
        });

        effect(() => {
            const searchValue: string = this.analogsSearchValue().trim();

            this.analogsState.set("loading");

            if (this.analogDebounceTimeout) {
                clearTimeout(this.analogDebounceTimeout);
            }

            if (searchValue.trim() == "") {
                this.analogsSearchResult.set([]);
                this.analogsState.set("enter");
                return;
            }

            this.analogDebounceTimeout = setTimeout(() => {
                const productsRequestOptions: ProductsRequestType = {
                    page: 1,
                    pageSize: 8,
                    search: searchValue,
                    sort: "nameAsc"
                }

                this.productsService.getProducts(false, productsRequestOptions)
                    .then((response: ProductsResponseType) => {
                        if ("products" in response) {
                            this.analogsSearchResult.set(response.products.filter((product: ProductType) => product.id !== this.editingProductId()));

                            if (response.totalCount === 0) {
                                this.analogsState.set("no-results");
                            }
                            else {
                                this.analogsState.set("loaded");
                            }
                        }
                        else {
                            this.messageService.showMessage("error", "Помилка", `Помилка: ${response.message}`);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
                    })
            }, 300);
        });
    }

    ngOnInit(): void {
        this.selectedSortingValue.set((localStorage.getItem("adminProductsSortingValue") as "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc") || "nameAsc");

        this.productsService.productsRequest.set({
            page: 1,
            pageSize: 20,
            sort: this.selectedSortingValue(),
        });

        this.loadProducts();
    }

    protected filterProducts(): void {
        this.productsService.productsRequest.update((request: ProductsRequestType) => ({
            ...request,
            page: 1,
        }));

        setTimeout(() => {
            this.state.set("loading");
            this.loadProducts();
        }, 0);
    }

    private loadProducts(): void {
        this.productsService.getProducts()
            .then((response: ProductsResponseType) => {
                if ("products" in response) {
                    this.products.set(response.products);

                    this.totalPages.set(response.totalPages);
                }
                else {
                    this.messageService.showMessage("error", "Помилка", `Помилка: ${response.message}`);
                }
            })
            .catch((error) => {
                console.error(error);
                this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
            });
    }

    protected searchClick(): void {
        this.productsService.productsRequest.update((request: ProductsRequestType) => {
            const searchValue: string = this.searchValue().trim();

            if (!searchValue) {
                const { search, ...productRequest } = request;

                return productRequest;
            }

            return {
                ...request,
                search: searchValue,
            };
        });

        this.filterProducts();
    }

    protected getProductImageUrl(product: ProductType): string {
        return product.image.length ? product.image[0] : "assets/product.png";
    }

    protected getProductPriceWithDiscount(product: ProductType): string {
        const discountedPrice: number = product.price * (1 - product.discount / 100);
        return discountedPrice.toFixed(2);
    }

    protected onPageChange(page: number): void {
        this.productsService.productsRequest.update((request: ProductsRequestType) => ({
            ...request,
            page: page
        }));

        this.loadProducts();
    }

    protected async editProduct(productId: string): Promise<void> {
        const product: ProductType | undefined = this.products().find((product: ProductType) => product.id === productId);
        if (!product) {
            this.messageService.showMessage("error", "Помилка вводу", "Товар не знайдено.");
            return;
        }

        this.editingProductId.set(product.id);
        this.discountValue.set(product.discount);
        this.isRecommendedValue.set(product.isRecommended);
        await this.productsService.getProductAnalogs(product.id).then((analogs: ProductType[] | { message: string }) => {
            if ("message" in analogs) {
                this.messageService.showMessage("error", "Помилка", `Не вдалося завантажити аналоги. Помилка: ${analogs.message}`);
                return;
            }

            this.analogsValue.set(analogs);
        });

        this.analogsSearchValue.set("");
        this.analogsSearchResult.set([]);
        this.analogsState.set("enter");

        this.isPopupSaveButtonDisabled.set(false);
        this.isEditingProduct.set(true);
    }

    protected closeProductPopup(): void {
        this.isEditingProduct.set(false);
    }

    protected isAnalogSelected(analogId: string): boolean {
        return this.analogsValue().some((analog: ProductType) => analog.id === analogId);
    }

    protected toggleAnalog(analog: ProductType): void {
        this.analogsValue.update((analogs: ProductType[]) => {
            if (this.isAnalogSelected(analog.id)) {
                return analogs.filter((tempAnalog: ProductType) => tempAnalog.id !== analog.id);
            }
            else {
                return [...analogs, analog];
            }
        });
    }

    protected removeAnalog(analogId: string): void {
        this.analogsValue.update((analogs: ProductType[]) => analogs.filter((analog: ProductType) => analog.id !== analogId));
    }

    protected saveProductChanges(): void {
        this.isPopupSaveButtonDisabled.set(true);

        this.productsService.updateProductById(this.editingProductId(), this.discountValue(), this.isRecommendedValue(), this.analogsValue())
            .then(() => {
                this.loadProducts();
                this.isEditingProduct.set(false);
            })
            .catch((error) => {
                console.error(error);
                this.messageService.showMessage("error", "Помилка", `Не вдалося зберегти зміни. Помилка: ${error.error.message ?? error.statusText}`);
            })
            .finally(() => {
                this.isPopupSaveButtonDisabled.set(false);
            });
    }
}