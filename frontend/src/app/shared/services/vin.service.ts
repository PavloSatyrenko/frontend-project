import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { VinRequestType } from "@shared/types/VinRequestType";
import { VinType } from "@shared/types/VinType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class VinService {
    private httpClient: HttpClient = inject(HttpClient);

    public async getAllRequests(): Promise<VinType[]> {
        return await firstValueFrom<VinType[]>(this.httpClient.get<VinType[]>(environment.serverURL + "/vin"));
    }

    public async sendRequest(name: string, phone: string, vin: string, text: string): Promise<{ message: string }> {
        const body: VinRequestType = {
            name,
            phone,
            vin,
            text,
        }

        return await firstValueFrom<{ message: string }>(this.httpClient.post<{ message: string }>(environment.serverURL + "/vin", body));
    }
}
