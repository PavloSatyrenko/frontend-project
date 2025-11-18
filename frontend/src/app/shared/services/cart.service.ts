import { HttpClient } from "@angular/common/http";
import { inject, Injectable, WritableSignal, signal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { ShopingCartProductType } from "@shared/types/ShopingCartProductType";
import { ShopingCartRequestType } from "@shared/types/ShopingCartRequestType";
import { ShopingCartResponseType } from "@shared/types/ShopingCartResponseType";
import { CookieService } from "ngx-cookie-service";
import { firstValueFrom } from "rxjs";
import { ProductType } from "@shared/types/ProductType";
import { ConfigService } from "./config.service";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";

type ShoppingCartEntry = Pick<ShopingCartProductType, "productId" | "amount" | "isChecked">;

@Injectable({
    providedIn: "root",
})
export class CartService {
    private readonly httpClient: HttpClient = inject(HttpClient);

    public readonly cartItemsCount: WritableSignal<number> = signal<number>(0);

    public readonly userRole: WritableSignal<UserRoleEnum> = signal<UserRoleEnum>(UserRoleEnum.Retail);

    private readonly cookieService: CookieService = inject(CookieService);
    private readonly configService: ConfigService = inject(ConfigService);

    public init(isUserAuthorized: boolean, userRole: UserRoleEnum): void {
        this.userRole.set(userRole);

        this.getShoppingCart(isUserAuthorized);
    }

    public async getShoppingCart(isUserAuthorized: boolean): Promise<ShopingCartProductType[]> {
        if (isUserAuthorized) {
            const cartItems = await firstValueFrom<ShopingCartProductType[]>(
                this.httpClient.get<ShopingCartProductType[]>(environment.serverURL + "/cart")
            );

            return this.applyRoleDiscount(cartItems);
        }

        const isCartItemsExists: boolean = this.cookieService.check("cartItems");

        if (!isCartItemsExists) {
            this.cookieService.set("cartItems", JSON.stringify([]), { path: "/" });
            this.cartItemsCount.set(0);
            return [];
        }

        let itemsArray: ShoppingCartEntry[] = JSON.parse(this.cookieService.get("cartItems"));

        if (itemsArray.length === 0) {
            this.cartItemsCount.set(0);
            return [];
        }

        return await firstValueFrom<ShopingCartProductType[]>(
            this.httpClient.post<ShopingCartProductType[]>(environment.serverURL + "/cart/offline", {
                cartItems: itemsArray,
            })
        ).then((cartItems: ShopingCartProductType[]) => this.applyRoleDiscount(cartItems));
    }

    public async addToCart(productId: string, isUserAuthorized: boolean): Promise<ShopingCartResponseType> {
        const body = {
            productId,
        };

        if (isUserAuthorized) {
            return await firstValueFrom<ShopingCartResponseType>(
                this.httpClient.post<ShopingCartResponseType>(environment.serverURL + "/cart", body)
            ).then((response: ShopingCartResponseType) => {
                this.cartItemsCount.update((count: number) => count + 1);
                return response;
            });
        }

        const productToAdd: ShoppingCartEntry = {
            productId,
            amount: 1,
            isChecked: false,
        };

        const isCartItemsExists: boolean = this.cookieService.check("cartItems");

        if (!isCartItemsExists) {
            this.cookieService.set("cartItems", JSON.stringify([productToAdd]), { path: "/" });
            this.cartItemsCount.set(1);
            return { message: "Product added to cart" };
        }

        let itemsArray: ShoppingCartEntry[] = JSON.parse(this.cookieService.get("cartItems"));

        if (!itemsArray.find((item: ShoppingCartEntry) => item.productId === productId)) {
            itemsArray.push(productToAdd);
            this.cookieService.set("cartItems", JSON.stringify(itemsArray), { path: "/" });
            this.cartItemsCount.set(itemsArray.length);
            return { message: "Product added to cart" };
        }

        return { message: "Product already in cart" };
    }

    public async toggleCartItemsSelection(isChecked: boolean, isUserAuthorized: boolean): Promise<{ message: string }> {
        const body = {
            isChecked,
        };

        if (isUserAuthorized) {
            return await firstValueFrom<{ message: string }>(
                this.httpClient.put<{ message: string }>(environment.serverURL + "/cart/toggle", body)
            );
        }

        const isCartItemsExists: boolean = this.cookieService.check("cartItems");

        if (!isCartItemsExists) {
            this.cookieService.set("cartItems", JSON.stringify([]), { path: "/" });
        }

        let itemsArray: ShoppingCartEntry[] = JSON.parse(this.cookieService.get("cartItems"));

        itemsArray.forEach((item: ShoppingCartEntry) => {
            item.isChecked = isChecked;
        });

        this.cookieService.set("cartItems", JSON.stringify(itemsArray), { path: "/" });

        return { message: "Cart items updated" };
    }

    public async removeFromCart(
        cartItemId: string,
        productId: string,
        isUserAuthorized: boolean
    ): Promise<{ message: string }> {
        if (isUserAuthorized) {
            return await firstValueFrom<{ message: string }>(
                this.httpClient.delete<{ message: string }>(environment.serverURL + `/cart/${cartItemId}`)
            ).then((response: { message: string }) => {
                this.cartItemsCount.update((count: number) => Math.max(0, count - 1));
                return response;
            });
        }

        const isCartItemsExists: boolean = this.cookieService.check("cartItems");

        if (!isCartItemsExists) {
            this.cookieService.set("cartItems", JSON.stringify([]), { path: "/" });
            this.cartItemsCount.set(0);
            return { message: "Product removed from cart" };
        }

        let itemsArray: ShoppingCartEntry[] = JSON.parse(this.cookieService.get("cartItems"));

        itemsArray = itemsArray.filter((item: ShoppingCartEntry) => item.productId !== productId);

        this.cookieService.set("cartItems", JSON.stringify(itemsArray), { path: "/" });
        this.cartItemsCount.set(itemsArray.length);

        return { message: "Product removed from cart" };
    }

    public async updateCartItem(
        cartItemId: string,
        amount: number,
        isChecked: boolean,
        productId: string,
        isUserAuthorized: boolean
    ): Promise<{ message: string }> {
        const body: ShopingCartRequestType = {
            amount,
            isChecked,
        };

        if (isUserAuthorized) {
            return await firstValueFrom<{ message: string }>(
                this.httpClient.put<{ message: string }>(environment.serverURL + `/cart/${cartItemId}`, body)
            );
        }

        const isCartItemsExists: boolean = this.cookieService.check("cartItems");

        if (!isCartItemsExists) {
            this.cookieService.set("cartItems", JSON.stringify([]), { path: "/" });
            return { message: "Cart item updated" };
        }

        let itemsArray: ShoppingCartEntry[] = JSON.parse(this.cookieService.get("cartItems"));

        itemsArray = itemsArray.map((item: ShoppingCartEntry) => {
            if (item.productId === productId) {
                item.amount = Math.min(amount, 10);
                item.isChecked = isChecked;
            }

            return item;
        });

        this.cookieService.set("cartItems", JSON.stringify(itemsArray), { path: "/" });

        return { message: "Cart item updated" };
    }

    public async addAllProductsToCart(products: ProductType[], isUserAuthorized: boolean): Promise<void> {
        if (isUserAuthorized) {
            const productIds = products.map((product: ProductType) => product.id);

            await firstValueFrom<{ message: string }>(
                this.httpClient.post<{ message: string }>(environment.serverURL + "/cart/multiple", { productIds })
            ).then(async (response: { message: string }) => {
                await this.getShoppingCart(true);
                return response;
            });

            return;
        }

        const isCartItemsExists: boolean = this.cookieService.check("cartItems");

        let itemsArray: ShoppingCartEntry[] = [];

        if (isCartItemsExists) {
            itemsArray = JSON.parse(this.cookieService.get("cartItems"));
        }

        products.forEach((product: ProductType) => {
            if (!itemsArray.find((item: ShoppingCartEntry) => item.productId === product.id)) {
                itemsArray.push({
                    productId: product.id,
                    amount: 1,
                    isChecked: false,
                });
            }
        });

        this.cookieService.set("cartItems", JSON.stringify(itemsArray), { path: "/" });
        this.cartItemsCount.set(itemsArray.length);
    }

    public async setShoppingCartFromCookiesToDB(): Promise<void> {
        const isCartItemsExists: boolean = this.cookieService.check("cartItems");

        if (!isCartItemsExists) {
            return;
        }

        const itemsArray: ShoppingCartEntry[] = JSON.parse(this.cookieService.get("cartItems"));

        if (itemsArray.length === 0) {
            this.cookieService.delete("cartItems", "/");
            return;
        }

        await firstValueFrom<{ message: string }>(
            this.httpClient.post<{ message: string }>(environment.serverURL + "/cart/offline/set", {
                cartItems: itemsArray,
            })
        ).then(() => {
            this.cookieService.delete("cartItems", "/");
        });
    }

    private applyRoleDiscount(cartItems: ShopingCartProductType[]): ShopingCartProductType[] {
        this.cartItemsCount.set(cartItems.length);

        const roleDiscount = this.configService.getRoleDiscountCoef(this.userRole());

        return cartItems.map((item: ShopingCartProductType) => {
            return {
                ...item,
                totalPrice: item.totalPrice * roleDiscount,
                product: {
                    ...item.product,
                    price: item.product.price * roleDiscount,
                },
            };
        });
    }
}
