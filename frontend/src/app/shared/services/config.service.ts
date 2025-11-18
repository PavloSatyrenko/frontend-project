import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { ConfigType } from "@shared/types/ConfigType";
import { firstValueFrom } from "rxjs";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";

@Injectable({
    providedIn: "root",
})
export class ConfigService {
    private readonly httpClient = inject(HttpClient);

    public readonly config: WritableSignal<ConfigType[]> = signal<ConfigType[]>([]);

    public async init(): Promise<void> {
        await this.getConfig();
    }

    public async getConfig(): Promise<ConfigType[]> {
        return await firstValueFrom<ConfigType[]>(
            this.httpClient.get<ConfigType[]>(environment.serverURL + "/config")
        ).then((con: ConfigType[]) => {
            this.config.set(con);

            return con;
        });
    }

    public async setConfigValue(key: string, value: string, group: string): Promise<{ message: string }> {
        const body = {
            key,
            value,
            group,
        };

        return await firstValueFrom<{ message: string }>(
            this.httpClient.put<{ message: string }>(environment.serverURL + "/config", body)
        ).then((response) => {
            this.config.update((con: ConfigType[]) => {
                return con.map((item: ConfigType) => {
                    return item.key === key ? { ...item, value } : item;
                });
            });

            return response;
        });
    }

    public getRoleDiscountCoef(userRole: UserRoleEnum): number {
        if (userRole === UserRoleEnum.Admin) {
            return 1;
        }

        const configRoleDiscount = this.config().find((con: ConfigType) => con.key === userRole);

        return 1 - +configRoleDiscount!.value / 100;
    }
}
