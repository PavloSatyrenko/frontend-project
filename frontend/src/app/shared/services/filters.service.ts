import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { FilterType } from "@shared/types/FilterType";
import { ProductsRequestType } from "@shared/types/ProductsRequestType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class FiltersService {
    private httpClient: HttpClient = inject(HttpClient);

    public async getFiltersForProducts(options: ProductsRequestType): Promise<FilterType[]> {
        return await firstValueFrom<FilterType[]>(this.httpClient.get<FilterType[]>(environment.serverURL + "/filter", { params: options }));
    }
}
