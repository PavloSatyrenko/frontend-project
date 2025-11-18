import { CommonModule } from "@angular/common";
import { Component, inject, input, InputSignal, OnDestroy, OnInit, output, OutputEmitterRef } from "@angular/core";
import { Event as RouterEvent, Router, NavigationEnd, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
    selector: "admin-menu",
    imports: [CommonModule, RouterLink],
    templateUrl: "./menu.html",
    styleUrl: "./menu.css"
})
export class Menu implements OnInit, OnDestroy {
    protected selectedPath: string = "products";

    private router: Router = inject(Router);

    public readonly isMenuVisible: InputSignal<boolean> = input<boolean>(false);

    public readonly click: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    private subscription: Subscription | null = null;

    ngOnInit(): void {
        this.subscription = this.router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationEnd) {
                this.selectedPath = event.url.split('/admin/')[1];
            }
        });

        this.selectedPath = this.router.url.split('/admin/')[1];
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected routeTo(path: string): string {
        return `/admin/${path}`;
    }
}