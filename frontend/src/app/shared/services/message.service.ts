import { Injectable, signal, WritableSignal } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class MessageService {
    public readonly header: WritableSignal<string> = signal<string>("");
    public readonly text: WritableSignal<string> = signal<string>("");
    public readonly type: WritableSignal<"success" | "info" | "error"> = signal<"success" | "info" | "error">("info");
    public readonly isVisible: WritableSignal<boolean> = signal<boolean>(false);
    public readonly linkText: WritableSignal<string> = signal<string>("");
    public readonly linkPath: WritableSignal<string[]> = signal<string[]>([]);

    private messageVisibleTimeout: ReturnType<typeof setTimeout> = setTimeout(() => { }, 0);

    public showMessage(type: "success" | "info" | "error", header: string, text: string, isButtonClearing: boolean = false): void {
        clearTimeout(this.messageVisibleTimeout);

        if (this.linkText() && !isButtonClearing) {
            setTimeout(() => {
                this.linkText.set("");
                this.linkPath.set([]);
            }, 300);
        }

        if (this.isVisible()) {
            this.isVisible.set(false);

            this.messageVisibleTimeout = setTimeout(() => {
                this.type.set(type);
                this.header.set(header);
                this.text.set(text);

                this.isVisible.set(true);
            }, 300);

            this.messageVisibleTimeout = setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
        else {
            this.type.set(type);
            this.header.set(header);
            this.text.set(text);

            this.isVisible.set(true);

            this.messageVisibleTimeout = setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }

    public showMessageWithButton(type: "success" | "info" | "error", header: string, text: string, linkText: string, linkPath: string[]) {
        if (this.isVisible()) {
            setTimeout(() => {
                this.linkText.set(linkText);
                this.linkPath.set(linkPath);
            }, 300);

            this.showMessage(type, header, text, true);
        }
        else {
            this.showMessage(type, header, text);

            this.linkText.set(linkText);
            this.linkPath.set(linkPath);
        }
    }

    public hideMessage() {
        this.isVisible.set(false);

        setTimeout(() => {
            this.linkText.set("");
            this.linkPath.set([]);
            this.header.set("");
            this.text.set("");
        }, 300)
    }
}
