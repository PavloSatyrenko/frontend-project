import { Filter, FilterValue } from "@prisma/client";
import { filterRepository } from "repositories/filter.repository";

type FullFilter = Filter & { filterValues: (Pick<FilterValue, "name">)[] };

export const filterService = {
    async getFilters(
        categoryId?: string,
        subcategoryIds?: string[],
        minPriceValue?: number,
        maxPriceValue?: number,
        manufacturers?: string[],
        discounts?: string[],
        search?: string
    ): Promise<FullFilter[]> {
        let isDiscounted: boolean | undefined = undefined;

        if (discounts && discounts.length === 1) {
            if (discounts[0] === "Зі знижкою") {
                isDiscounted = true;
            }
            else if (discounts[0] === "Без знижки") {
                isDiscounted = false;
            }
        }

        return await filterRepository.getFilters(categoryId, subcategoryIds, minPriceValue, maxPriceValue, manufacturers, isDiscounted, search);
    }
}