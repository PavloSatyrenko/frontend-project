import { OrderStatusEnum } from "./OrderStatusEnum";

export type OrderRequestType = {
    page: number,
    pageSize: number,
    period?: "MONTH" | "HALF_YEAR" | "YEAR",
    status?: OrderStatusEnum,
    search?: string,
}