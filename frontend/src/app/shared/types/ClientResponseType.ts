import { ClientType } from "./ClientType";

export type ClientResponseType = {
    clients: ClientType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
} | { message: string };