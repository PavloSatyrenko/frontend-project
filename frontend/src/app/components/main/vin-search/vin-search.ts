import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Textarea } from "@shared/components/textarea/textarea";
import { MessageService } from "@shared/services/message.service";
import { VinService } from "@shared/services/vin.service";

@Component({
    selector: "main-vin-search",
    imports: [Textarea, Input, Button],
    templateUrl: "./vin-search.html",
    styleUrl: "./vin-search.css"
})
export class VinSearch {
    public readonly name: WritableSignal<string> = signal<string>("");
    public readonly phone: WritableSignal<string> = signal<string>("");
    public readonly vin: WritableSignal<string> = signal<string>("");
    public readonly details: WritableSignal<string> = signal<string>("");

    private messageService: MessageService = inject(MessageService);
    private vinService: VinService = inject(VinService);

    sendRequest(): void {
        if (this.name().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Ім'я введенно некоректно.");
            return;
        }

        if (this.phone().slice(4) == "" || this.phone().slice(4).length != 9) {
            this.messageService.showMessage("error", "Помилка вводу", "Телефон введенно некоректно.");
            return;
        }

        if (this.vin().length != 17 || this.vin().includes(" ")) {
            this.messageService.showMessage("error", "Помилка вводу", "VIN-код введенно некоректно.");
            return;
        }

        if (this.details().trim() == "") {
            this.messageService.showMessage("error", "Помилка вводу", "Поле запчастин не може бути порожнім.");
            return;
        }

        this.vinService.sendRequest(this.name(), this.phone(), this.vin(), this.details())
            .then(() => {
                this.messageService.showMessage("success", "Успіх", "Запит успішно надіслано. Скоро з Вами зв'яжуться наші робітники.");

                this.name.set("");
                this.phone.set("");
                this.vin.set("");
                this.details.set("");
            })
            .catch((error) => {
                console.error(error);

                this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
            });
    }
}
