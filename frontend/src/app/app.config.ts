import {
    provideAppInitializer,
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
    inject,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { Interceptor } from "@core/interceptor";
import { AuthService } from "@shared/services/auth.service";
import { ConfigService } from "@shared/services/config.service";
import { CartService } from "@shared/services/cart.service";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";
import { ProductsService } from "@shared/services/products.service";

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([Interceptor])),
        provideZonelessChangeDetection(),
        provideAppInitializer(async () => {
            const configService: ConfigService = inject(ConfigService);
            const authService: AuthService = inject(AuthService);
            const cartService: CartService = inject(CartService);
            const productsService: ProductsService = inject(ProductsService);

            await configService.init();
            await authService.init();

            const user = authService.user();

            cartService.init(!!user, user ? user.role : UserRoleEnum.Retail);

            productsService.init(user ? user.role : UserRoleEnum.Retail);
        }),
    ],
};
