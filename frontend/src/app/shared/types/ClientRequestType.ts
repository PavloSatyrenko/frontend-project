import { UserRoleEnum } from "./UserRoleEnum"

export type ClientRequestType = {
    page: number,
    pageSize: number,
    role?: UserRoleEnum,
    search?: string
}