import { Component, computed, inject, Signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CartService } from "@shared/services/cart.service";

@Component({
    selector: "app-mobile-menu",
    imports: [RouterLink],
    templateUrl: "./mobile-menu.html",
    styleUrl: "./mobile-menu.css",
})
export class MobileMenu {
    private router: Router = inject(Router);

    protected cartItemCount: Signal<number> = computed<number>(() => this.cartService.cartItemsCount());

    private cartService: CartService = inject(CartService);

    protected scrollToVin(): void {
        const vinBlock = document.getElementById("vinBlock");
        if (vinBlock) {
            vinBlock.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        else {
            this.router.navigate(["/"], { fragment: "vin-block" });
        }
    }
}
