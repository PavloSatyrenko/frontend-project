import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { ProductsRequestType } from "@shared/types/ProductsRequestType";
import { ProductsResponseType } from "@shared/types/ProductsResponseType";
import { ProductType } from "@shared/types/ProductType";
import { CookieService } from "ngx-cookie-service";
import { firstValueFrom, map, Observable, shareReplay, Subject, Subscriber, Subscription, switchMap, tap } from "rxjs";
import { ConfigService } from "./config.service";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";

@Injectable({
    providedIn: "root",
})
export class ProductsService {
    public productsRequest: WritableSignal<ProductsRequestType> = signal<ProductsRequestType>({
        page: 1,
        pageSize: 20,
    });

    public productsSearch: WritableSignal<string> = signal<string>("");

    public productsResponse: WritableSignal<ProductsResponseType> = signal<ProductsResponseType>({
        products: [],
        totalCount: 0,
        totalPages: 0,
        page: 1,
        pageSize: 20,
        maxPrice: 0,
    });

    public readonly userRole: WritableSignal<UserRoleEnum> = signal<UserRoleEnum>(UserRoleEnum.Retail);

    private httpClient: HttpClient = inject(HttpClient);
    private cookieService: CookieService = inject(CookieService);
    private configService: ConfigService = inject(ConfigService);

    private requestSubject = new Subject<{ options: ProductsRequestType; hasToUpdateResponse: boolean }>();

    private products$: Observable<ProductsResponseType> = this.requestSubject.pipe(
        switchMap(({ options, hasToUpdateResponse }) =>
            this.httpClient.get<ProductsResponseType>(environment.serverURL + "/product", { params: options }).pipe(
                map((response: ProductsResponseType) => {
                    if ("products" in response) {
                        return {
                            ...response,
                            products: this.applyRoleDiscount(response.products) as ProductType[],
                        };
                    }

                    return response;
                }),
                tap((response: ProductsResponseType) => {
                    if (hasToUpdateResponse) {
                        this.productsResponse.set(response);
                    }
                })
            )
        ),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    public init(userRole: UserRoleEnum): void {
        this.userRole.set(userRole);
    }

    public async getProducts(
        hasToUpdateResponse: boolean = true,
        options: ProductsRequestType = this.productsRequest()
    ): Promise<ProductsResponseType> {
        return await firstValueFrom(
            new Observable<ProductsResponseType>((subscriber: Subscriber<ProductsResponseType>) => {
                const productSubscription: Subscription = this.products$.subscribe(subscriber);
                this.requestSubject.next({ options, hasToUpdateResponse });
                return productSubscription;
            })
        );
    }

    public async getProductById(productId: string): Promise<ProductType> {
        return await firstValueFrom<ProductType>(
            this.httpClient.get<ProductType>(environment.serverURL + `/product/${productId}`).pipe(
                map((product: ProductType) => {
                    return (this.applyRoleDiscount([product]) as ProductType[])[0];
                })
            )
        );
    }

    public async updateProductById(
        productId: string,
        discount: number,
        isRecommended: boolean,
        analogs: ProductType[]
    ): Promise<null> {
        const analogIds: string[] = analogs.map((analog: ProductType) => analog.id);

        return await firstValueFrom<null>(
            this.httpClient.put<null>(environment.serverURL + `/product/${productId}`, {
                discount,
                isRecommended,
                analogIds,
            })
        );
    }

    public async getProductAnalogs(productId: string): Promise<ProductType[] | { message: string }> {
        return await firstValueFrom<ProductType[] | { message: string }>(
            this.httpClient
                .get<ProductType[] | { message: string }>(environment.serverURL + `/product/${productId}/analogs`)
                .pipe(map((response: ProductType[] | { message: string }) => this.applyRoleDiscount(response)))
        );
    }

    public async getFavoriteProducts(
        sortOrder: "nameAsc" | "nameDesc" | "priceAsc" | "priceDesc",
        isUserAuthorized: boolean
    ): Promise<ProductType[] | { message: string }> {
        if (isUserAuthorized) {
            return await firstValueFrom<ProductType[] | { message: string }>(
                this.httpClient
                    .get<ProductType[] | { message: string }>(environment.serverURL + "/product/me/favorites", {
                        params: { sort: sortOrder },
                    })
                    .pipe(map((response: ProductType[] | { message: string }) => this.applyRoleDiscount(response)))
            );
        }

        const isFavoriteItemsExists: boolean = this.cookieService.check("favoriteItems");

        if (!isFavoriteItemsExists) {
            this.cookieService.set("favoriteItems", JSON.stringify([]), { path: "/" });
            return [];
        }

        let itemsArray: string[] = JSON.parse(this.cookieService.get("favoriteItems"));

        if (itemsArray.length === 0) {
            return [];
        }

        return await firstValueFrom<ProductType[] | { message: string }>(
            this.httpClient
                .post<ProductType[] | { message: string }>(environment.serverURL + "/product/favorites/offline", {
                    productIds: itemsArray,
                })
                .pipe(map((response: ProductType[] | { message: string }) => this.applyRoleDiscount(response)))
        );
    }

    public async getProductRecommendations(): Promise<ProductType[] | { message: string }> {
        return await firstValueFrom<ProductType[] | { message: string }>(
            this.httpClient
                .get<ProductType[] | { message: string }>(environment.serverURL + "/product/recommendations")
                .pipe(map((response: ProductType[] | { message: string }) => this.applyRoleDiscount(response)))
        );
    }

    public async addProductToFavorites(productId: string, isUserAuthorized: boolean): Promise<null> {
        if (isUserAuthorized) {
            return await firstValueFrom<null>(
                this.httpClient.post<null>(environment.serverURL + `/product/me/favorites/${productId}`, {})
            );
        }

        const isFavoriteItemsExists: boolean = this.cookieService.check("favoriteItems");

        if (!isFavoriteItemsExists) {
            this.cookieService.set("favoriteItems", JSON.stringify([productId]), { path: "/" });
            return null;
        }

        let itemsArray: string[] = JSON.parse(this.cookieService.get("favoriteItems"));

        if (!itemsArray.find((item: string) => item === productId)) {
            itemsArray.push(productId);
            this.cookieService.set("favoriteItems", JSON.stringify(itemsArray), { path: "/" });
            return null;
        }

        return null;
    }

    public async removeProductFromFavorites(productId: string, isUserAuthorized: boolean): Promise<null> {
        if (isUserAuthorized) {
            return await firstValueFrom<null>(
                this.httpClient.delete<null>(environment.serverURL + `/product/me/favorites/${productId}`)
            );
        }

        const isFavoriteItemsExists: boolean = this.cookieService.check("favoriteItems");

        if (!isFavoriteItemsExists) {
            return null;
        }

        let itemsArray: string[] = JSON.parse(this.cookieService.get("favoriteItems"));

        itemsArray = itemsArray.filter((item: string) => item !== productId);

        this.cookieService.set("favoriteItems", JSON.stringify(itemsArray), { path: "/" });

        return null;
    }

    public async setFavoritesFromCookiesToDB(): Promise<void> {
        const isFavoritesExists: boolean = this.cookieService.check("favoriteItems");

        if (!isFavoritesExists) {
            return;
        }

        const itemsArray: string[] = JSON.parse(this.cookieService.get("favoriteItems"));

        if (itemsArray.length === 0) {
            this.cookieService.delete("favoriteItems", "/");
            return;
        }

        await firstValueFrom<{ message: string }>(
            this.httpClient.post<{ message: string }>(environment.serverURL + "/product/favorites/offline/set", {
                productIds: itemsArray,
            })
        ).then(() => {
            this.cookieService.delete("favoriteItems", "/");
        });
    }

    private applyRoleDiscount(response: ProductType[] | { message: string }): ProductType[] | { message: string } {
        if (!("message" in response)) {
            const roleDiscount = this.configService.getRoleDiscountCoef(this.userRole());

            return response.map((product: ProductType) => ({
                ...product,
                price: product.price * roleDiscount,
            }));
        }

        return response;
    }
}
