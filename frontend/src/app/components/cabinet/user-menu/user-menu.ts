import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnDestroy, OnInit, output, OutputEmitterRef, signal, Signal, WritableSignal } from "@angular/core";
import { Event as RouterEvent, Router, RouterLink, NavigationEnd } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { AuthService } from "@shared/services/auth.service";
import { Subscription } from "rxjs";

@Component({
    selector: "cabinet-user-menu",
    imports: [RouterLink, CommonModule, Button],
    templateUrl: "./user-menu.html",
    styleUrl: "./user-menu.css"
})
export class UserMenu implements OnInit, OnDestroy {
    protected selectedPath: string = "profile";

    public readonly isMenuVisible: WritableSignal<boolean> = signal<boolean>(false);

    public readonly click: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    protected readonly isUserAuthorized: Signal<boolean> = computed(() => !!this.authService.user());

    private subscription: Subscription | null = null;

    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);

    ngOnInit(): void {
        this.subscription = this.router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationEnd) {
                this.selectedPath = event.url.split("/cabinet/")[1];
            }
        });

        this.selectedPath = this.router.url.split("/cabinet/")[1];
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected routeTo(path: string): string {
        return `/cabinet/${path}`;
    }

    protected logout(): void {
        this.authService.logout();

        this.router.navigate(["/"]);
    }

    protected openMenu(): void {
        this.isMenuVisible.set(true);
    }

    protected closeMenu(): void {
        this.isMenuVisible.set(false);
    }
}
