import { PrismaClient, VinOrder } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const vinRepository = {
    async getAllVinOrders(): Promise<VinOrder[]> {
        return await prisma.vinOrder.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
    },

    async addVinOrder(name: string, phone: string, vin: string, text: string): Promise<void> {
        await prisma.vinOrder.create({
            data: {
                name: name,
                phone: phone,
                vin: vin,
                text: text
            }
        });
    }
}