import { ProductType } from "./ProductType";

export type ProductsResponseType = {
    products: ProductType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
    maxPrice: number | null;
} | { message: string };