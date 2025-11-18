import { Config } from "@prisma/client";
import { configRepository } from "repositories/config.repository";

export const configService = {
    async getConfig(): Promise<Config[]> {
        return await configRepository.getConfig();
    },

    async setConfigValue(key: string, value: string, group: string): Promise<void> {
        return await configRepository.setConfigValue(key, value, group);
    }
}