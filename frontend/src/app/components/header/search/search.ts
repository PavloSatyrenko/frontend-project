import { CommonModule } from "@angular/common";
import { Component, effect, inject, OnDestroy, OnInit, signal, WritableSignal, HostListener, ElementRef, Signal, viewChild } from "@angular/core";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { FormatProductNamePipe } from "@shared/pipes/format-product-name.pipe";
import { MessageService } from "@shared/services/message.service";
import { ProductsService } from "@shared/services/products.service";
import { ProductsRequestType } from "@shared/types/ProductsRequestType";
import { ProductsResponseType } from "@shared/types/ProductsResponseType";
import { ProductType } from "@shared/types/ProductType";
import { Subscription } from "rxjs";

@Component({
    selector: "header-search",
    imports: [CommonModule, Button, Input, RouterLink, FormatProductNamePipe],
    templateUrl: "./search.html",
    styleUrl: "./search.css"
})
export class Search implements OnInit, OnDestroy {
    protected searchValue: WritableSignal<string> = signal<string>("");

    protected isSearchContainerVisible: WritableSignal<boolean> = signal<boolean>(false);
    protected isMobileSearchInputVisible: WritableSignal<boolean> = signal<boolean>(false);

    protected input: Signal<Input> = viewChild.required<Input>("input");
    protected mobileInput: Signal<Input> = viewChild.required<Input>("mobileInput");

    protected products: WritableSignal<ProductType[]> = signal([]);

    protected state: WritableSignal<"loading" | "loaded" | "no-results"> = signal<"loading" | "loaded" | "no-results">("loading");

    private routeSubscription!: Subscription;

    private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    private productsService: ProductsService = inject(ProductsService);
    private messageService: MessageService = inject(MessageService);
    private router: Router = inject(Router);
    private elementRef: ElementRef = inject(ElementRef);

    constructor() {
        effect(() => {
            const searchValue: string = this.searchValue().trim();

            this.state.set("loading");

            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }

            if (this.searchValue().trim() == "") {
                this.products.set([])
                return;
            }

            this.debounceTimeout = setTimeout(() => {
                this.productsService.productsSearch.set(searchValue);

                const productsRequestOptions: ProductsRequestType = {
                    page: 1,
                    pageSize: 7,
                    search: searchValue,
                    sort: "nameAsc"
                }

                this.productsService.getProducts(false, productsRequestOptions)
                    .then((response: ProductsResponseType) => {
                        if ("products" in response) {
                            this.products.set(response.products);

                            if (response.totalCount === 0) {
                                this.state.set("no-results");
                            }
                            else {
                                this.state.set("loaded");
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

        effect(() => {
            if (this.isSearchContainerVisible() && this.searchValue()) {
                document.body.style.overflow = "hidden";
            }
            else {
                document.body.style.overflow = "";
            }
        });

        effect(() => {
            if (this.isMobileSearchInputVisible() && this.mobileInput()) {
                this.mobileInput()!.focusInput();
            }
        });
    }

    ngOnInit(): void {
        this.routeSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.hideSearch();
            }
        });
    }

    ngOnDestroy(): void {
        this.routeSubscription.unsubscribe();
        document.body.style.overflow = "";
    }

    protected openSearch(): void {
        this.isSearchContainerVisible.set(true);
        this.isMobileSearchInputVisible.set(true)
    }

    protected hideSearch(): void {
        this.isSearchContainerVisible.set(false);
        this.isMobileSearchInputVisible.set(false);
        this.input().blurInput();
    }

    protected showMobileSearchInput(): void {
        this.isMobileSearchInputVisible.set(true);

        if (this.searchValue().trim()) {
            this.isSearchContainerVisible.set(true);
        }
    }

    @HostListener("document:click", ["$event"])
    onDocumentClick(event: Event): void {
        if (this.isSearchContainerVisible() && !this.elementRef.nativeElement.contains(event.target)) {
            this.hideSearch();
        }
    }

    protected discountedPrice(product: ProductType): number {
        return product.price * (1 - product.discount / 100);
    }

    protected searchOnEnterDown(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            this.isMobileSearchInputVisible.set(false);
            this.search();
        }
        else {
            this.openSearch();
        }
    }

    protected search(): void {
        if (this.searchValue().trim()) {
            this.hideSearch();
            this.router.navigate(["/products"], { queryParams: { search: this.searchValue().trim() } });
        }
        else if (this.router.url.includes("/products") || this.router.url.includes("/category")) {
            this.router.navigate(["/products"], { queryParams: {} });
        }
    }

    protected getProductImageUrl(product: ProductType): string {
        return product.image.length ? product.image[0] : "assets/product.png";
    }
}
