export type ProductsRequestType = Partial<{
    page: number;
    pageSize: number;
    search: string;
    categoryId: string;
    subcategoryIds: string[];
    minPrice: number;
    maxPrice: number;
    manufacturers: string[];
    discounts: string[];
    availability: string[];
    sort: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";
}>