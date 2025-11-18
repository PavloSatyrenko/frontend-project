import { PrismaClient, Category } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const categoryRepository = {
    async getAllCategories(): Promise<Category[]> {
        return await prisma.category.findMany({
            orderBy: {
                csvId: "asc"
            }
        });
    },

    async getTopCategories(limit: number): Promise<Omit<Category, "parentId">[]> {
        return await prisma.category.findMany({
            where: {
                parentId: null
            },
            omit: {
                parentId: true
            },
            orderBy: {
                csvId: "asc"
            },
            take: limit
        });
    },

    async getCategoryById(categoryId: string): Promise<Category | null> {
        return await prisma.category.findUnique({
            where: {
                id: categoryId
            }
        });
    },
}