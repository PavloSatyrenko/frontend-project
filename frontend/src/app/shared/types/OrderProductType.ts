import { ProductType } from "./ProductType";

export type OrderProductType = {
    id: string;
    price: number;
    priceOut?: number;
    priceOutBasic?: number;
    amount: number;
    product: ProductType;
};

// export type OrderProductType = Omit<ProductType, 'availability'> & {
//     amount: number,
//     totalPrice: number,
// }
