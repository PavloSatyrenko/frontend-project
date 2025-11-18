import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { AuthService } from "@shared/services/auth.service";
import { ClientsService } from "@shared/services/clients.service";
import { MessageService } from "@shared/services/message.service";
import { UserType } from "@shared/types/UserType";

@Component({
    selector: "cabinet-profile",
    imports: [Input, Title, Button],
    templateUrl: "./profile.html",
    styleUrl: "./profile.css",
})
export class Profile implements OnInit {
    protected readonly nameValue: WritableSignal<string> = signal<string>("");
    protected readonly surnameValue: WritableSignal<string> = signal<string>("");
    protected readonly emailValue: WritableSignal<string> = signal<string>("");
    protected readonly phoneValue: WritableSignal<string> = signal<string>("");
    protected readonly passwordValue: WritableSignal<string> = signal<string>("");
    protected readonly confirmPasswordValue: WritableSignal<string> = signal<string>("");

    protected readonly isPasswordConfirmating: WritableSignal<boolean> = signal<boolean>(false);

    private authService: AuthService = inject(AuthService);
    private clientService: ClientsService = inject(ClientsService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        const user: UserType = this.authService.user()!;

        this.nameValue.set(user.name);
        this.surnameValue.set(user.surname);
        this.emailValue.set(user.email == null ? "" : user.email);
        this.phoneValue.set(user.phone);
    }

    protected openPasswordConfirmation(): void {
        this.isPasswordConfirmating.set(true);
    }

    protected closePasswordConfirmation(): void {
        this.isPasswordConfirmating.set(false);

        this.phoneValue.set("");
        this.passwordValue.set("");
    }

    protected saveUser(): void {
        const emailRegExp: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

        if (this.nameValue().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Ім'я введенно некоректно.");
            return;
        }

        if (this.surnameValue().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Прізвище введенно некоректно.");
            return;
        }

        if (this.emailValue().trim() !== "" && !emailRegExp.test(this.emailValue().trim())) {
            this.messageService.showMessage("error", "Помилка вводу", "Пошта введенна некоректно.");
            return;
        }

        if (this.phoneValue().slice(4) == "" || this.phoneValue().length != 10) {
            this.messageService.showMessage("error", "Помилка вводу", "Телефон введенно некоректно.");
            return;
        }

        if (this.passwordValue() !== "" && this.passwordValue().length < 6) {
            this.messageService.showMessage("error", "Помилка вводу", "Пароль повинен містити не менше 6 символів.");
            return;
        }

        if (this.passwordValue() !== this.confirmPasswordValue()) {
            this.messageService.showMessage("error", "Помилка вводу", "Паролі не співпадають.");
            return;
        }

        this.clientService
            .updatePersonalData(
                this.nameValue(),
                this.surnameValue(),
                this.emailValue(),
                this.phoneValue(),
                this.passwordValue()
            )
            .then(() => {
                this.messageService.showMessage("success", "Успіх", "Дані акаунта успішно збережені.");

                const user: UserType = this.authService.user()!;

                this.authService.user.set({
                    ...user,
                    name: this.nameValue(),
                    surname: this.surnameValue(),
                    email: this.emailValue(),
                    phone: this.phoneValue(),
                });
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
