import { Category } from "@prisma/client";
import { Request, Response } from "express";
import { categoryService } from "services/category.service";

type CategoryWithSubcategories = Omit<Category, "parentId"> & {
    subcategories: CategoryWithSubcategories[];
};

export const categoryController = {
    async getCategories(request: Request, response: Response): Promise<void> {
        try {
            const amount: number | undefined = request.query.amount ? parseInt(request.query.amount as string) : undefined;

            let categories: CategoryWithSubcategories[] = await categoryService.getCategories(amount);

            response.status(200).json(categories);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async getCategoryById(request: Request, response: Response): Promise<void> {
        try {
            const categoryId: string = request.params.id;

            const category: Omit<Category, "parentId"> | null = await categoryService.getCategoryById(categoryId);

            if (!category) {
                response.status(404).json({ message: "Category not found" });
                return;
            }

            response.status(200).json(category);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    }
}