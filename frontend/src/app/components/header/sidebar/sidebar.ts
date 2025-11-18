import { CommonModule } from "@angular/common";
import { Component, computed, inject, Signal, signal, WritableSignal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { Logo } from "@shared/components/logo/logo";
import { AuthService } from "@shared/services/auth.service";
import { CartService } from "@shared/services/cart.service";
import { UserType } from "@shared/types/UserType";

@Component({
    selector: "header-sidebar",
    imports: [Logo, Button, CommonModule, RouterLink],
    templateUrl: "./sidebar.html",
    styleUrl: "./sidebar.css"
})
export class Sidebar {
    protected isVisible: WritableSignal<boolean> = signal(false);

    protected cartItemCount: Signal<number> = computed<number>(() => this.cartService.cartItemsCount());

    protected user: Signal<UserType | null> = computed<UserType | null>(() => this.authService.user());

    protected authService: AuthService = inject(AuthService);
    protected cartService: CartService = inject(CartService);
    private router: Router = inject(Router);

    protected closeSidebar(): void {
        this.isVisible.set(false);
    }

    protected openSidebar(): void {
        this.isVisible.set(true);
    }

    protected logout(): void {
        this.authService.logout();

        this.closeSidebar()

        if (this.router.url.startsWith("/cabinet")) {
            this.router.navigate(["/"]);
        }
    }

    protected scrollToVin(): void {
        const vinBlock = document.getElementById("vinBlock");
        if (vinBlock) {
            vinBlock.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            this.router.navigate(["/"], { fragment: "vin-block" });
        }

        this.closeSidebar()
    }
}
