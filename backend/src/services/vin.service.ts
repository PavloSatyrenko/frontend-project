import { VinOrder } from "@prisma/client";
import { vinRepository } from "repositories/vin.repository";

export const vinService = {
    async getAllRequests(): Promise<VinOrder[]> {
        return await vinRepository.getAllVinOrders();
    },

    async sendRequest(name: string, phone: string, vin: string, text: string): Promise<void> {
        return await vinRepository.addVinOrder(name, phone, vin, text);
    }
}