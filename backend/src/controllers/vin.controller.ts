import { VinOrder } from "@prisma/client";
import { Request, Response } from "express";
import { vinService } from "services/vin.service";

export const vinController = {
    async getAllRequests(request: Request, response: Response): Promise<void> {
        try {
            const requests: VinOrder[] = await vinService.getAllRequests();

            response.status(200).json(requests);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async sendRequest(request: Request, response: Response): Promise<void> {
        try {
            const name: string = request.body.name;
            const phone: string = request.body.phone;
            const vin: string = request.body.vin;
            const text: string = request.body.text;

            await vinService.sendRequest(name, phone, vin, text);

            response.status(200).json({ message: "Request sent successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    }
}