import { UserRoleEnum } from "./UserRoleEnum";

export type UserType = {
    id: string;
    name: string;
    surname: string;
    phone: string;
    email?: string;
    role: UserRoleEnum
}