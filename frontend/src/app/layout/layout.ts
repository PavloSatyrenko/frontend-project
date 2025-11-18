import { registerLocaleData } from "@angular/common";
import localeUk from '@angular/common/locales/uk';
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Event as RouterEvent, Router, RouterOutlet, NavigationEnd } from "@angular/router";
import { Footer } from "@components/footer/footer";
import { Header } from "@components/header/header";
import { MobileMenu } from "@components/mobile-menu/mobile-menu";
import { Message } from "@shared/components/message/message";
import { Subscription } from "rxjs";

registerLocaleData(localeUk);

@Component({
    selector: "app-layout",
    imports: [RouterOutlet, Header, Footer, MobileMenu, Message],
    templateUrl: "./layout.html",
    styleUrl: "./layout.css"
})
export class Layout implements OnInit, OnDestroy {
    protected isHeaderVisible: boolean = true;
    protected isFooterVisible: boolean = true;
    protected isMobileMenuVisible: boolean = true;

    private subscription: Subscription | null = null;

    private router: Router = inject(Router);

    ngOnInit(): void {
        this.subscription = this.router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationEnd) {
                if (event.url.includes('auth')) {
                    this.isHeaderVisible = false;
                    this.isFooterVisible = false;
                    this.isMobileMenuVisible = false;
                }
                else if (event.url.includes('order-create')) {
                    this.isHeaderVisible = true;
                    this.isFooterVisible = false;
                    this.isMobileMenuVisible = false;
                }
                else {
                    this.isHeaderVisible = true;
                    this.isFooterVisible = true;
                    this.isMobileMenuVisible = true;
                }
            }
        });

        if (this.router.url.includes('auth')) {
            this.isHeaderVisible = false;
            this.isFooterVisible = false;
            this.isMobileMenuVisible = false;
        }
        else if (this.router.url.includes('order-create')) {
            this.isHeaderVisible = true;
            this.isFooterVisible = false;
            this.isMobileMenuVisible = false;
        }
        else {
            this.isHeaderVisible = true;
            this.isFooterVisible = true;
            this.isMobileMenuVisible = true;
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}