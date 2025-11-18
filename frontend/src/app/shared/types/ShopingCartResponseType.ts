export type ShopingCartResponseType = {
    id: string,
    userId: string,
    productId: string,
    amount: number,
    isChecked: boolean,
    message: string
} | {
    message: string
};