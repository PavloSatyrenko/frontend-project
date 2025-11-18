import { OrderType } from "./OrderType";
import { UserType } from "./UserType";

export type ClientType = UserType & {
    discount: number;
    totalOrders: number;
    orders?: OrderType[];
}