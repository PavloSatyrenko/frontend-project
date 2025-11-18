import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { CartService } from "@shared/services/cart.service";
import { ConfigService } from "@shared/services/config.service";
import { ProductsService } from "@shared/services/products.service";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";

@Component({
    selector: "app-root",
    imports: [RouterOutlet],
    template: "<router-outlet></router-outlet>",
})
export class App implements OnInit {
    private configService: ConfigService = inject(ConfigService);
    private authService: AuthService = inject(AuthService);
    private cartService: CartService = inject(CartService);
    private productsService: ProductsService = inject(ProductsService);

    public async ngOnInit(): Promise<void> {
        await this.configService.init();
        await this.authService.init();

        const user = this.authService.user();

        this.cartService.init(!!user, user ? user.role : UserRoleEnum.Retail);

        this.productsService.init(user ? user.role : UserRoleEnum.Retail);
    }
}
