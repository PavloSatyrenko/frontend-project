import { ProductType } from "./ProductType";

export type ShopingCartProductType = {
    id: string,
    userId: string,
    productId: string,
    product: ProductType,
    amount: number,
    totalPrice: number,
    isChecked: boolean
};