import { OrderType } from "./OrderType"

export type OrderResponseType = {
    orders: OrderType[],
    totalCount: number,
    totalPages: number,
    page: number,
    pageSize: number
}