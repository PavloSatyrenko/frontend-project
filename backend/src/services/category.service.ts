import { Category } from "@prisma/client";
import { categoryRepository } from "repositories/category.repository";

type CategoryWithSubcategories = Category & {
    subcategories: CategoryWithSubcategories[];
};

type CategoryWithSubcategoriesWithoutParent = Omit<Category, "parentId"> & {
    subcategories: CategoryWithSubcategoriesWithoutParent[];
};

export const categoryService = {
    async getCategories(limit?: number): Promise<CategoryWithSubcategoriesWithoutParent[]> {
        if (limit) {
            const topCategories: Omit<Category, "parentId">[] = await categoryRepository.getTopCategories(limit);

            return topCategories.map((category: Omit<Category, "parentId">) => ({
                ...category,
                subcategories: []
            }));
        }
        else {
            const allCategories: Category[] = await categoryRepository.getAllCategories();

            const categoriesMap: Map<string, CategoryWithSubcategories> = new Map<string, CategoryWithSubcategories>();
            allCategories.forEach((category: Category) => categoriesMap.set(category.id, { ...category, subcategories: [] }));

            const rootCategories: CategoryWithSubcategories[] = [];

            for (const category of categoriesMap.values()) {
                if (category.parentId) {
                    categoriesMap.get(category.parentId)?.subcategories.push(category);
                }
                else {
                    rootCategories.push(category);
                }
            }

            const removeParentId = (category: CategoryWithSubcategories): CategoryWithSubcategoriesWithoutParent => {
                const { parentId, ...categoryWithoutParentId } = category;

                return {
                    ...categoryWithoutParentId,
                    subcategories: category.subcategories.map(removeParentId)
                };
            };

            return rootCategories.map(removeParentId);
        }
    },

    async getCategoryById(categoryId: string): Promise<CategoryWithSubcategoriesWithoutParent | null> {
        const category: Category | null = await categoryRepository.getCategoryById(categoryId);

        if (!category) {
            return null;
        }

        const result: Category[] = [category];
        let currentCategory: Category = category;

        while (currentCategory.parentId) {
            const parentCategory: Category | null = await categoryRepository.getCategoryById(currentCategory.parentId);

            if (!parentCategory) {
                break;
            }

            result.unshift(parentCategory);
            currentCategory = parentCategory;
        }

        const categoriesMap: Map<string, CategoryWithSubcategories> = new Map<string, CategoryWithSubcategories>();
        result.forEach((category: Category) => categoriesMap.set(category.id, { ...category, subcategories: [] }));

        const rootCategories: CategoryWithSubcategories[] = [];

        for (const category of categoriesMap.values()) {
            if (category.parentId) {
                categoriesMap.get(category.parentId)?.subcategories.push(category);
            }
            else {
                rootCategories.push(category);
            }
        }

        const removeParentId = (category: CategoryWithSubcategories): CategoryWithSubcategoriesWithoutParent => {
            const { parentId, ...categoryWithoutParentId } = category;

            return {
                ...categoryWithoutParentId,
                subcategories: category.subcategories.map(removeParentId)
            };
        };

        return rootCategories.map(removeParentId)[0];
    }
}