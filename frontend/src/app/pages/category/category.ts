import {
    Component,
    computed,
    effect,
    inject,
    OnDestroy,
    OnInit,
    Signal,
    signal,
    untracked,
    WritableSignal,
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { CategoryType } from "@shared/types/CategoryType";
import { Title } from "@shared/components/title/title";
import { FilterType } from "@shared/types/FilterType";
import { Chips } from "@shared/components/chips/chips";
import { Filters } from "@components/category/filters/filters";
import { PriceFilter } from "@components/category/price-filter/price-filter";
import { ProductType } from "@shared/types/ProductType";
import { ProductCard } from "@shared/components/product-card/product-card";
import { Select } from "@shared/components/select/select";
import { Button } from "@shared/components/button/button";
import { Tags } from "@components/category/tags/tags";
import { FilterValueType } from "@shared/types/FilterValueType";
import { ProductsService } from "@shared/services/products.service";
import { ProductsRequestType } from "@shared/types/ProductsRequestType";
import { ProductsResponseType } from "@shared/types/ProductsResponseType";
import { CategoriesService } from "@shared/services/categories.service";
import { FiltersService } from "@shared/services/filters.service";
import { MessageService } from "@shared/services/message.service";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";

type SelectedFilterType = FilterValueType & { filterId: string };

@Component({
    selector: "page-category",
    imports: [Title, Chips, Filters, PriceFilter, ProductCard, Select, Button, Tags, CommonModule],
    templateUrl: "./category.html",
    styleUrl: "./category.css",
})
export class Category implements OnInit, OnDestroy {
    private categoryId: WritableSignal<string | null> = signal<string | null>(null);

    protected isCategoryPage: Signal<boolean> = computed<boolean>(
        () => this.router.url.startsWith("/category/") && this.categoryId() !== null
    );

    protected categories: WritableSignal<CategoryType[]> = signal<CategoryType[]>([]);
    protected categoryTitle: Signal<string> = computed<string>(
        () => this.categories()[this.categories().length - 1]?.name
    );

    protected searchQuery: WritableSignal<string | null> = signal<string | null>(null);

    protected minPriceValue: WritableSignal<number> = signal<number>(0);
    protected maxPriceValue: WritableSignal<number> = signal<number>(0);

    protected maxPrice: WritableSignal<number> = signal<number>(0);

    protected filters: WritableSignal<FilterType[]> = signal<FilterType[]>([]);
    protected selectedFilters: WritableSignal<SelectedFilterType[]> = signal<SelectedFilterType[]>([]);

    protected isFilterBlockVisible: WritableSignal<boolean> = signal<boolean>(false);

    protected selectedSortingValue: WritableSignal<"priceAsc" | "priceDesc" | "nameAsc" | "nameDesc"> = signal<
        "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc"
    >("nameAsc");

    protected state: WritableSignal<"loading" | "loading-more" | "loaded" | "no-results"> = signal<
        "loading" | "loading-more" | "loaded" | "no-results"
    >("loading");
    protected filtersState: WritableSignal<"loading" | "loaded"> = signal<"loading" | "loaded">("loading");

    protected products: WritableSignal<ProductType[]> = signal<ProductType[]>([]);

    protected readonly productsAmount: Signal<number> = computed<number>(() => {
        const productsResponse: ProductsResponseType = this.productsService.productsResponse();

        if ("message" in productsResponse) {
            return 0;
        }

        return productsResponse.totalCount;
    });

    protected isShowMoreButtonVisible: WritableSignal<boolean> = signal<boolean>(true);

    private priceTimeout: ReturnType<typeof setTimeout> | null = null;

    private paramsSubscription: Subscription | null = null;
    private queryParamsSubscription: Subscription | null = null;

    private activeRoute: ActivatedRoute = inject(ActivatedRoute);
    private router: Router = inject(Router);
    private productsService: ProductsService = inject(ProductsService);
    private categoriesService: CategoriesService = inject(CategoriesService);
    private filtersService: FiltersService = inject(FiltersService);
    private messageService: MessageService = inject(MessageService);

    constructor() {
        effect(() => {
            const productsRequest: ProductsRequestType = untracked(this.productsService.productsRequest);

            if (this.maxPriceValue() > 0 && productsRequest.maxPrice !== this.maxPriceValue()) {
                this.productsService.productsRequest.update((request: ProductsRequestType) => ({
                    ...request,
                    maxPrice: this.maxPriceValue(),
                }));
            }
        });

        effect(() => {
            this.productsService.productsRequest.update((request: ProductsRequestType) => ({
                ...request,
                minPrice: this.minPriceValue(),
            }));
        });

        effect(() => {
            const selectedSortingValue: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc" = this.selectedSortingValue();

            localStorage.setItem("selectedSortingValue", selectedSortingValue);

            this.productsService.productsRequest.update((request: ProductsRequestType) => ({
                ...request,
                sort: selectedSortingValue,
            }));
        });

        effect(() => {
            const selectedFilters: SelectedFilterType[] = this.selectedFilters();

            this.productsService.productsRequest.update((request: ProductsRequestType) => ({
                ...request,
                subcategoryIds: selectedFilters
                    .filter((filter: SelectedFilterType) => filter.filterId == "1")
                    .map((filter: SelectedFilterType) => filter.id),
                manufacturers: selectedFilters
                    .filter((filter: SelectedFilterType) => filter.filterId == "2")
                    .map((filter: SelectedFilterType) => filter.name),
                discounts: selectedFilters
                    .filter((filter: SelectedFilterType) => filter.filterId == "3")
                    .map((filter: SelectedFilterType) => filter.name),
            }));
        });
    }

    ngOnInit(): void {
        this.paramsSubscription = this.activeRoute.params.subscribe((params: Params) => {
            this.categoryId.set(params["categoryId"] || null);

            const categoryId: string | null = this.categoryId();

            if (categoryId) {
                this.categoriesService
                    .getCategoryById(categoryId)
                    .then((category: CategoryType | { message: string }) => {
                        if ("message" in category) {
                            this.router.navigate(["category"]);
                            return;
                        }

                        this.categories.set(this.flattenCategories([category]));
                    })
                    .catch((error) => {
                        console.error(error);
                        this.messageService.showMessage(
                            "error",
                            "Некоректна категорія",
                            `Категорія ${this.categoryId} не існує.`
                        );

                        this.router.navigate(["category"]);
                    });
            }

            this.selectedSortingValue.set(
                (localStorage.getItem("selectedSortingValue") as "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc") ||
                    "nameAsc"
            );

            if (this.isCategoryPage()) {
                this.productsService.productsRequest.set({
                    page: 1,
                    pageSize: 20,
                    categoryId: categoryId!,
                    sort: this.selectedSortingValue(),
                });

                this.initialize();
            }
        });

        this.queryParamsSubscription = this.activeRoute.queryParams.subscribe((queryParams: Params) => {
            if (!this.isCategoryPage()) {
                const searchQuery: string | null = queryParams["search"] || null;
                this.searchQuery.set(searchQuery);

                this.selectedSortingValue.set(
                    (localStorage.getItem("selectedSortingValue") as
                        | "priceAsc"
                        | "priceDesc"
                        | "nameAsc"
                        | "nameDesc") || "nameAsc"
                );

                if (searchQuery) {
                    this.productsService.productsRequest.set({
                        page: 1,
                        pageSize: 20,
                        search: searchQuery,
                        sort: this.selectedSortingValue(),
                    });
                } else {
                    this.productsService.productsRequest.set({
                        page: 1,
                        pageSize: 20,
                        sort: this.selectedSortingValue(),
                    });
                }
            }

            this.initialize();
        });
    }

    ngOnDestroy(): void {
        if (this.paramsSubscription) {
            this.paramsSubscription.unsubscribe();
        }

        if (this.queryParamsSubscription) {
            this.queryParamsSubscription.unsubscribe();
        }
    }

    private initialize(): void {
        this.filtersState.set("loading");

        this.filters.set([]);
        this.selectedFilters.set([]);

        this.loadFilters();

        this.state.set("loading");
        this.loadProducts(false).then((response: Exclude<ProductsResponseType, { message: string }>) => {
            if (response.maxPrice !== null) {
                this.minPriceValue.set(0);
                this.maxPrice.set(Math.ceil(response.maxPrice));
                this.maxPriceValue.set(Math.ceil(response.maxPrice));
            }
        });
    }

    protected filterProducts(isPriceFilter: boolean = false): void {
        this.productsService.productsRequest.update((request: ProductsRequestType) => ({
            ...request,
            page: 1,
        }));

        if (isPriceFilter) {
            if (this.priceTimeout) {
                clearTimeout(this.priceTimeout);
            }

            this.priceTimeout = setTimeout(() => {
                this.filtersState.set("loading");
                this.state.set("loading");
                this.loadFilters();
                this.loadProducts(false);
            }, 300);
        } else {
            setTimeout(() => {
                this.filtersState.set("loading");
                this.state.set("loading");
                this.loadFilters();
                this.loadProducts(false);
            }, 0);
        }
    }

    protected showMore(): void {
        const productsResponse: ProductsResponseType = this.productsService.productsResponse();

        if ("message" in productsResponse) {
            return;
        }

        this.productsService.productsRequest.update((request: ProductsRequestType) => ({
            ...request,
            page: (request.page || 0) + 1,
        }));

        this.state.set("loading-more");

        this.loadFilters();

        this.loadProducts(true);
    }

    private loadFilters(): void {
        this.filtersService
            .getFiltersForProducts(this.productsService.productsRequest())
            .then((filters: FilterType[]) => {
                filters = filters.map((filter: FilterType) => {
                    return {
                        ...filter,
                        filterValues: filter.filterValues.sort((a: FilterValueType, b: FilterValueType) => {
                            if (a.hasChildren === b.hasChildren) {
                                return 0;
                            }
                            return a.hasChildren ? -1 : 1;
                        }),
                    };
                });

                this.filters.set(filters);

                this.filtersState.set("loaded");
            });
    }

    private async loadProducts(doShowPrevious: boolean): Promise<Exclude<ProductsResponseType, { message: string }>> {
        return new Promise<Exclude<ProductsResponseType, { message: string }>>((resolve, reject) => {
            this.productsService
                .getProducts()
                .then((response: ProductsResponseType) => {
                    if ("message" in response) {
                        console.error(response.message);
                        this.messageService.showMessage(
                            "error",
                            "Помилка",
                            "Сталася помилка під час завантаження товарів. Спробуйте оновити сторінку."
                        );
                        reject(response.message);
                        return;
                    }

                    if (doShowPrevious) {
                        this.products.update((products: ProductType[]) => [...products, ...response.products]);
                    } else {
                        this.products.set(response.products);
                    }

                    this.isShowMoreButtonVisible.set(response.page < response.totalPages);

                    if (response.totalCount === 0) {
                        this.state.set("no-results");
                    } else {
                        this.state.set("loaded");
                    }

                    resolve(response);
                })
                .catch((error) => {
                    console.error(error);
                    this.messageService.showMessage(
                        "error",
                        "Помилка",
                        "Сталася помилка під час завантаження товарів. Спробуйте оновити сторінку."
                    );
                    this.state.set("loaded");
                    reject(error);
                });
        });
    }

    private flattenCategories(categories: CategoryType[]): CategoryType[] {
        return categories.flatMap((category: CategoryType) => {
            if (category.subcategories) {
                return [category, ...this.flattenCategories(category.subcategories)];
            } else {
                return category;
            }
        });
    }

    protected openMobileFilter(): void {
        this.isFilterBlockVisible.set(true);
    }

    protected closeMobileFilter(): void {
        this.isFilterBlockVisible.set(false);
    }
}
