import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { ClientsService } from "@shared/services/clients.service";
import { UserType } from "@shared/types/UserType";
import { firstValueFrom, Observable, switchMap } from "rxjs";
import { CartService } from "./cart.service";
import { ProductsService } from "./products.service";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    public readonly user: WritableSignal<UserType | null> = signal<UserType | null>(null);

    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly clientService: ClientsService = inject(ClientsService);
    private readonly cartService: CartService = inject(CartService);
    private readonly productsService: ProductsService = inject(ProductsService);

    public async signUp(user: Omit<UserType, "id"> & { password: string }): Promise<{ message: string }> {
        return await firstValueFrom(this.httpClient.post<{ accessToken: string, refreshToken: string }>(environment.serverURL + "/auth/sign-up", user))
            .then((response: { accessToken: string, refreshToken: string }) => {
                sessionStorage.setItem("accessToken", response.accessToken);
                localStorage.setItem("refreshToken", response.refreshToken);

                this.getAuthorizedUser();

                this.cartService.setShoppingCartFromCookiesToDB();
                this.productsService.setFavoritesFromCookiesToDB();
                this.cartService.init(true, user.role);

                return { message: "User registered successfully" };
            });
    }

    public async login(credentials: { phone: string; password: string }): Promise<{ message: string }> {
        return await firstValueFrom(this.httpClient.post<{ accessToken: string, refreshToken: string }>(environment.serverURL + "/auth/login", credentials))
            .then((response: { accessToken: string, refreshToken: string }) => {
                sessionStorage.setItem("accessToken", response.accessToken);
                localStorage.setItem("refreshToken", response.refreshToken);

                this.getAuthorizedUser();

                this.cartService.setShoppingCartFromCookiesToDB();
                this.productsService.setFavoritesFromCookiesToDB();
                this.cartService.init(true, this.user() ? this.user()!.role : UserRoleEnum.Retail);

                return { message: "User logged in successfully" };
            });
    }

    public async getAuthorizedUser(): Promise<UserType> {
        return await this.clientService.getPersonalData()
            .then((response: UserType) => {
                this.user.set(response);
                return response;
            });
    }

    public async logout(): Promise<{ message: string }> {
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        this.user.set(null);

        this.cartService.init(false, UserRoleEnum.Retail);

        return { message: "Logged out successfully" };
        // return await firstValueFrom<{ message: string }>(this.httpClient.post<{ message: string }>(environment.serverURL + "/auth/logout", {}))
        //     .then((response) => {
        //         this.user.set(null);

        //         this.cartService.init(false, UserRoleEnum.Retail);

        //         return response;
        //     });
    }

    public refreshToken(): Observable<{ accessToken: string }> {
        const refreshToken: string | null = localStorage.getItem("refreshToken");

        const refreshObservable: Observable<{ accessToken: string }> = this.httpClient.post<{ accessToken: string }>(environment.serverURL + "/auth/refresh", { refreshToken });

        refreshObservable.subscribe((response: { accessToken: string }) => {
            sessionStorage.setItem("accessToken", response.accessToken);
        });

        return refreshObservable;
    }

    public getUserRole(): UserRoleEnum {
        return !!this.user() ? this.user()!.role : UserRoleEnum.Retail;
    }

    public async init(): Promise<void> {
        await this.getAuthorizedUser()
            .catch(() => {
                this.user.set(null);
            });
    }
}
