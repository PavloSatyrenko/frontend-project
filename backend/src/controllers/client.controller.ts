import { Role, User } from "@prisma/client";
import { Request, Response } from "express";
import { clientService } from "services/client.service";

type FullClientType = Omit<User, "passwordHash"> & { totalOrders: number };

type ClientPaginationType = {
    clients: FullClientType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
}

export const clientController = {
    async getClients(request: Request, response: Response): Promise<void> {
        try {
            const page: number = parseInt(request.query.page as string) || 1;
            const pageSize: number = parseInt(request.query.pageSize as string) || 10;
            const role: Role | undefined = request.query.role as Role | undefined;
            const search: string | undefined = request.query.search as string | undefined;

            const clients: ClientPaginationType = await clientService.getClients(page, pageSize, role, search);

            response.status(200).json(clients);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async getPersonalData(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;

            const user: Omit<User, "passwordHash"> | null = await clientService.getPersonalData(userId);

            if (user) {
                response.status(200).json(user);
            }
            else {
                response.status(404).json({ message: "User not found" });
            }
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateClient(request: Request, response: Response): Promise<void> {
        try {
            const clientId: string = request.params.id;
            const name: string = request.body.name;
            const surname: string = request.body.surname;
            const phone: string = request.body.phone;
            const role: Role = request.body.role;
            const email: string = request.body.email;
            const discount: number = request.body.discount;

            await clientService.updateClient(clientId, name, surname, phone, role, email, discount);

            response.status(204).send();
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async updatePersonalData(request: Request, response: Response): Promise<void> {
        try {
            const clientId: string = request.user!.id;
            const name: string = request.body.name;
            const surname: string = request.body.surname;
            const phone: string = request.body.phone;
            const email: string = request.body.email;
            const password: string | undefined = request.body.password;

            await clientService.updatePersonalData(clientId, name, surname, phone, email, password);

            response.status(204).send();
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    }
}