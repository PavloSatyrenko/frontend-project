import { Role, User } from "@prisma/client";
import { clientRepository } from "repositories/client.repository";
import bcrypt from "bcrypt";

type FullClientType = Omit<User, "passwordHash"> & { totalOrders: number };

type ClientPaginationType = {
    clients: FullClientType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
}

export const clientService = {
    async getClients(page: number, pageSize: number, role?: Role, search?: string): Promise<ClientPaginationType> {
        const { clients, totalCount } = await clientRepository.getClients(page, pageSize, role, search);

        const resultClients: FullClientType[] = clients
            .map((client: Omit<User, "passwordHash"> & { _count: { orders: number } }) => {
                const { _count, ...restFields } = client;

                return {
                    ...restFields,
                    totalOrders: _count.orders
                };
            });

        const totalPages: number = Math.ceil(totalCount / pageSize);

        return {
            clients: resultClients,
            totalCount,
            totalPages,
            page,
            pageSize
        };
    },

    async getPersonalData(userId: string): Promise<Omit<User, "passwordHash"> | null> {
        return await clientRepository.getUserById(userId);
    },

    async updateClient(clientId: string, name: string, surname: string, phone: string, role: Role, email: string, discount: number): Promise<void> {
        if (phone.startsWith("+38")) {
            phone = phone.slice(3);
        }

        await clientRepository.updateClient(clientId, name, surname, phone, role, email, discount);
    },

    async updatePersonalData(userId: string, name: string, surname: string, phone: string, email: string, password?: string): Promise<void> {
        try {
            if (phone.startsWith("+38")) {
                phone = phone.slice(3);
            }

            let passwordHash: string | undefined = undefined;
            if (password) {
                passwordHash = await bcrypt.hash(password, 12);
            }

            await clientRepository.updatePersonalData(userId, name, surname, phone, email, passwordHash);
        }
        catch (error) {
            throw error;
        }
    }
}