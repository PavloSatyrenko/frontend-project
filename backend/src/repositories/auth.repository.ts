import { PrismaClient, RefreshToken, User } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const authRepository = {
    async createUser(user: Omit<User, "id" | "discount" | "isRegistered">): Promise<User> {
        return prisma.user.create({
            data: user
        });
    },

    async makeUserRegistered(userId: string, userData: Omit<User, "id" | "discount" | "isRegistered">): Promise<User> {
        return prisma.user.update({
            where: {
                id: userId
            },
            data: {
                ...userData,
                isRegistered: true
            }
        });
    },

    async findUserByPhone(phone: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {
                phone: phone
            }
        });
    },

    async createRefreshToken(refreshToken: string, userId: string): Promise<void> {
        await prisma.refreshToken.create({
            data: {
                refreshToken: refreshToken,
                userId: userId
            }
        });
    },

    async findRefreshToken(refreshToken: string): Promise<RefreshToken | null> {
        return prisma.refreshToken.findUnique({ where: { refreshToken: refreshToken } });
    }
}