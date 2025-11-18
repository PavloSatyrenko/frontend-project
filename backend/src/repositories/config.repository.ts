import { Config, PrismaClient, VinOrder } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const configRepository = {
    async getConfig(): Promise<Config[]> {
        return await prisma.config.findMany({
            orderBy: {
                key: "asc"
            }
        });
    },

    async setConfigValue(key: string, value: string, group: string): Promise<void> {
        await prisma.config.upsert({
            where: {
                key: key
            },
            update: {
                value: value,
                group: group
            },
            create: {
                key: key,
                value: value,
                group: group
            }
        });
    }
}
