import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { Link } from "@shared/components/link/link";
import { AuthService } from "@shared/services/auth.service";
import { Router } from "@angular/router";
import { MessageService } from "@shared/services/message.service";

@Component({
    template: "auth-login",
    imports: [Title, Input, Button, Link],
    templateUrl: "./login.html",
    styleUrl: "./login.css",
})
export class Login {
    protected phone: WritableSignal<string> = signal<string>("");
    protected password: WritableSignal<string> = signal<string>("");

    private hasSubmitted: boolean = false;

    private authService: AuthService = inject(AuthService);
    private messageService: MessageService = inject(MessageService);
    private router: Router = inject(Router);

    protected isFieldValid(field: string): boolean {
        if (!this.hasSubmitted) {
            return true;
        }

        switch (field) {
            case "phone":
                return this.phone().length === 10 && this.phone().startsWith("0");
            case "password":
                return this.password().length >= 6;
            default:
                return true;
        }
    }

    protected async onSubmit(): Promise<void> {
        this.hasSubmitted = true;

        if (!this.phone() || !this.password()) {
            return;
        }

        await this.authService
            .login({
                phone: this.phone(),
                password: this.password(),
            })
            .then(() => {
                this.router.navigate(["/"]);
            })
            .catch((error) => {
                console.error(error);
                this.messageService.showMessage(
                    "error",
                    "Помилка",
                    `Помилка: ${error.error.message ?? error.statusText}`
                );
            });
    }
}
