import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { Input } from "@shared/components/input/input";
import { Button } from "@shared/components/button/button";
import { Link } from "@shared/components/link/link";
import { Select } from "@shared/components/select/select";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";
import { AuthService } from "@shared/services/auth.service";
import { Router } from "@angular/router";

@Component({
    template: "page-signup",
    imports: [Title, Input, Button, Link, Select],
    templateUrl: "./signup.html",
    styleUrl: "./signup.css"
})
export class Signup {
    protected phone: WritableSignal<string> = signal<string>("");
    protected name: WritableSignal<string> = signal<string>("");
    protected surname: WritableSignal<string> = signal<string>("");
    protected password: WritableSignal<string> = signal<string>("");
    protected confirmPassword: WritableSignal<string> = signal<string>("");
    protected selectedRole: WritableSignal<UserRoleEnum> = signal<UserRoleEnum>(UserRoleEnum.Retail);

    private hasSubmitted: boolean = false;

    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);

    protected isFieldValid(field: string): boolean {
        if (!this.hasSubmitted) {
            return true;
        }

        switch (field) {
            case "phone":
                return this.phone().length === 10 && this.phone().startsWith("0");
            case "name":
                return this.name().length >= 2;
            case "surname":
                return this.surname().length >= 2;
            case "password":
                return this.password().length >= 6 && this.password() === this.confirmPassword();
            case "confirmPassword":
                return this.confirmPassword().length >= 6 && this.confirmPassword() === this.password();
            default:
                return true;
        }
    }

    protected async onSubmit(): Promise<void> {
        this.hasSubmitted = true;

        if (!this.phone() || !this.name() || !this.surname() || !this.password() || !this.confirmPassword() || (this.password() !== this.confirmPassword())) {
            return;
        }

        await this.authService.signUp({
            phone: this.phone(),
            name: this.name(),
            surname: this.surname(),
            password: this.password(),
            role: this.selectedRole()
        }).then(() => {
            this.router.navigate(["/"]);
        });
    }
}