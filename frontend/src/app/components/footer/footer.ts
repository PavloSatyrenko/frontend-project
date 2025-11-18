import { Component, computed, inject, Signal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { Logo } from "@shared/components/logo/logo";
import { Link } from "@shared/components/link/link";
import { ConfigService } from "@shared/services/config.service";
import { ConfigType } from "@shared/types/ConfigType";

@Component({
    selector: "app-footer",
    imports: [Title, Logo, Link],
    templateUrl: "./footer.html",
    styleUrl: "./footer.css"
})
export class Footer {
    protected readonly phone1: Signal<string> = computed(() => this.configService.config().find((config: ConfigType) => config.key === "firstPhone")?.value || "");
    protected readonly phone2: Signal<string> = computed(() => this.configService.config().find((config: ConfigType) => config.key === "secondPhone")?.value || "");
    protected readonly email: Signal<string> = computed(() => this.configService.config().find((config: ConfigType) => config.key === "email")?.value || "");

    private configService: ConfigService = inject(ConfigService);

    getTelPath(phone: string): string {
        return `tel:${phone.replace(/[\s()-]/g, "")}`;
    }

    getMailToPath(email: string): string {
        return `mailto:${email.replace(/\s+/g, "")}`;
    }

    protected scrollToVin(): void {
        const vinBlock = document.getElementById('vinBlock');
        if (vinBlock) {
            vinBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            window.location.href = '/#vin-block';
        }
    }
}