import { Config } from "@prisma/client";
import { Request, Response } from "express";
import { configService } from "services/config.service";

export const configController = {
    async getConfig(request: Request, response: Response): Promise<void> {
        try {
            const config: Config[] = await configService.getConfig();

            response.status(200).json(config);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async setConfigValue(request: Request, response: Response): Promise<void> {
        try {
            const key: string = request.body.key;
            const value: string = request.body.value;
            const group: string = request.body.group;

            await configService.setConfigValue(key, value, group);

            response.status(200).json({ message: "Config value set successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    }
}