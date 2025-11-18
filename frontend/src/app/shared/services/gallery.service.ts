import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { GalleryType } from "@shared/types/GalleryType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class GalleryService {
    private httpClient: HttpClient = inject(HttpClient);

    public async getGallery(): Promise<GalleryType[]> {
        return await firstValueFrom<GalleryType[]>(this.httpClient.get<GalleryType[]>(environment.serverURL + "/gallery"))
    }

    public async getAdminGalleryPages(isActive: string): Promise<GalleryType[]> {
        const params: Record<string, string> = {};

        if (isActive !== "ALL") {
            params["isActive"] = isActive;
        }

        return await firstValueFrom<GalleryType[]>(this.httpClient.get<GalleryType[]>(environment.serverURL + "/gallery/admin", { params }));
    }

    public async uploadImage(image: File): Promise<string> {
        const presignedUrl: string = (await firstValueFrom<{ url: string }>(this.httpClient.get<{ url: string }>(environment.serverURL + "/gallery/image-url"))).url;

        return (await firstValueFrom<{ Key: string }>(this.httpClient.put<{ Key: string }>(presignedUrl, image))).Key;
    }

    public async addGalleryPage(title: string, description: string, imageKey: string): Promise<void> {
        await firstValueFrom<void>(this.httpClient.post<void>(environment.serverURL + "/gallery", { title, description, imageKey }));
    }

    public async updateGalleryPage(id: string, title: string, description: string, isActive: boolean, imageKey?: string): Promise<void> {
        await firstValueFrom<void>(this.httpClient.put<void>(environment.serverURL + `/gallery/${id}`, { title, description, isActive, imageKey }));
    }

    public async updateGalleryPageOrder(id: string, orderDirection: "UP" | "DOWN"): Promise<void> {
        await firstValueFrom<void>(this.httpClient.put<void>(environment.serverURL + `/gallery/${id}/order`, { orderDirection }));
    }

    public async deleteGalleryPage(id: string): Promise<void> {
        await firstValueFrom<void>(this.httpClient.delete<void>(environment.serverURL + `/gallery/${id}`));
    }
}

