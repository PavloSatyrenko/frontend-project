import { OrderProductType } from "./OrderProductType"
import { OrderStatusEnum } from "./OrderStatusEnum"

export type OrderType = {
    id: string,
    number: number,
    date: string,
    status: OrderStatusEnum,
    userId: string,
    name: string,
    surname: string,
    phone: string,
    email: string | null,
    invoice: string | null,
    productsPrice: number,
    productsAmount: number,
    deliveryMethod: string,
    deliveryPrice: number,
    totalPrice: number,
    orderItems: OrderProductType[]
}