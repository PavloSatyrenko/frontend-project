import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { CategoryType } from "@shared/types/CategoryType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class CategoriesService {
    private httpClient: HttpClient = inject(HttpClient);

    public async getAllCategories(): Promise<CategoryType[]> {
        return await firstValueFrom<CategoryType[]>(this.httpClient.get<CategoryType[]>(environment.serverURL + "/category"));
    }

    public async getCategories(amount: number): Promise<CategoryType[]> {
        return await firstValueFrom<CategoryType[]>(this.httpClient.get<CategoryType[]>(environment.serverURL + "/category", { params: { amount: amount.toString() } }));
    }

    public async getCategoryById(categoryId: string): Promise<CategoryType | { message: string }> {
        return await firstValueFrom<CategoryType | { message: string }>(this.httpClient.get<CategoryType | { message: string }>(environment.serverURL + "/category/" + categoryId));
    }
}
