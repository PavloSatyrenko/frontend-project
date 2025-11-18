import { Category, Filter, FilterValue, PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

type FullFilter = Filter & { filterValues: (Omit<FilterValue, "filterId">)[] };

type CategoryWithSubcategories = Pick<Category, "id" | "name"> & {
    subcategories: CategoryWithSubcategories[];
    hasChildren: boolean;
};

export const filterRepository = {
    async getFilters(
        categoryId?: string,
        subcategoryIds?: string[],
        minPriceValue?: number,
        maxPriceValue?: number,
        manufacturers?: string[],
        isDiscounted?: boolean,
        search?: string
    ): Promise<FullFilter[]> {
        const words: string[] = search?.split(/\s+/).filter(Boolean) ?? [];

        const allCategories: { id: string, name: string, parentId: string | null }[] = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                parentId: true
            }
        });

        const getAllSubcategoryIds = async (parentIds: string[]): Promise<string[]> => {
            if (parentIds.length === 0) return [];

            const categoriesMap: Map<string, string[]> = new Map<string, string[]>();
            allCategories.forEach((category: { id: string, name: string, parentId: string | null }) => {
                if (category.parentId) {
                    if (!categoriesMap.has(category.parentId)) {
                        categoriesMap.set(category.parentId, []);
                    }
                    categoriesMap.get(category.parentId)!.push(category.id);
                }
            });

            const getChildrenIds = (parentId: string): string[] => {
                const result: string[] = [parentId];
                const children: string[] = categoriesMap.get(parentId) || [];

                for (const childId of children) {
                    result.push(...getChildrenIds(childId));
                }

                return result;
            };

            const allIds: Set<string> = new Set<string>();
            parentIds.forEach((parentId: string) => {
                getChildrenIds(parentId).forEach((id: string) => allIds.add(id));
            });

            return Array.from(allIds);
        };

        let categoryIdsToFilter: string[] = [];
        if (subcategoryIds && subcategoryIds.length > 0) {
            categoryIdsToFilter = await getAllSubcategoryIds(subcategoryIds);
        }
        else if (categoryId) {
            categoryIdsToFilter = await getAllSubcategoryIds([categoryId]);
        }

        const baseWhereStatement = {
            ...(
                isDiscounted !== undefined && {
                    discount: isDiscounted ? { gt: 0 } : 0
                }
            ),
            ...((!search || search.length < 4) && {
                name: {
                    not: ""
                }
            }),
            ...(
                search && {
                    AND: words.map((word: string) => ({
                        OR: [
                            {
                                name: {
                                    startsWith: word,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                name: {
                                    contains: ` ${word}`,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                name: {
                                    contains: `/${word}`,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                name: {
                                    contains: `-${word}`,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                manufacturer: {
                                    startsWith: word,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                manufacturer: {
                                    contains: ` ${word}`,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                code: {
                                    contains: word,
                                    mode: "insensitive" as const
                                }
                            },
                        ]
                    }))
                }
            ),
            ...(
                (minPriceValue !== undefined || maxPriceValue !== undefined) && {
                    price: {
                        ...(
                            minPriceValue !== undefined && {
                                gte: minPriceValue
                            }
                        ),
                        ...(
                            maxPriceValue !== undefined && {
                                lte: maxPriceValue
                            }
                        )
                    }
                }
            )
        };

        const manufacturersWhereStatement = {
            ...baseWhereStatement,
            ...(
                categoryIdsToFilter.length > 0 && {
                    categoryIds: {
                        hasSome: categoryIdsToFilter
                    }
                }
            )
        };

        const categoryIdsWhereStatement = {
            ...baseWhereStatement,
            ...(
                manufacturers && manufacturers.length > 0 && {
                    manufacturer: {
                        in: manufacturers
                    }
                }
            )
        };

        let [availableManufacturers, productsWithCategories] = await Promise.all([
            prisma.product.findMany({
                where: manufacturersWhereStatement,
                distinct: ["manufacturer"],
                select: {
                    manufacturer: true
                },
                orderBy: {
                    manufacturer: "asc"
                }
            }),

            categoryIdsToFilter.length > 0
                ? prisma.product.findMany({
                    where: categoryIdsWhereStatement,
                    select: { categoryIds: true }
                })
                : Promise.resolve([])
        ]);

        if (manufacturers && manufacturers.length > 0) {
            const availableManufacturersSet: Set<string> = new Set(availableManufacturers
                .map((manufacturer: { manufacturer: string }) => manufacturer.manufacturer));

            manufacturers.forEach((manufacturer: string) => {
                if (!availableManufacturersSet.has(manufacturer)) {
                    availableManufacturers.push({ manufacturer });
                }
            });

            availableManufacturers.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
        }

        let availableSubcategories: { id: string, name: string, hasChildren: boolean }[] = [];

        if (categoryIdsToFilter.length > 0 || !categoryId) {
            const categoryIdsWithProducts: Set<string> = new Set();
            productsWithCategories.forEach((product: { categoryIds: string[] }) => {
                product.categoryIds.forEach((tempCategoryId: string) => categoryIdsWithProducts.add(tempCategoryId));
            });

            if (subcategoryIds && subcategoryIds.length > 0) {
                subcategoryIds.forEach((subcategoryId: string) => {
                    categoryIdsWithProducts.add(subcategoryId);
                });
            }

            if (!categoryId) {
                const rootCategories: { id: string, name: string, parentId: string | null }[] = allCategories.filter((category: { id: string, name: string, parentId: string | null }) =>
                    category.parentId === null
                );

                availableSubcategories = rootCategories.map((category: { id: string, name: string, parentId: string | null }) => ({
                    id: category.id,
                    name: category.name,
                    hasChildren: allCategories.some((categoryTemp: { id: string, name: string, parentId: string | null }) => categoryTemp.parentId === category.id)
                }));
            }
            else {
                const getHierarchy = async (parentId: string, name: string): Promise<CategoryWithSubcategories[]> => {
                    const allCategories: { id: string, name: string, parentId: string | null }[] = await prisma.category.findMany({
                        select: {
                            id: true,
                            name: true,
                            parentId: true
                        }
                    });

                    const categoriesMap: Map<string, { id: string, name: string, parentId: string | null }[]> = new Map<string, { id: string, name: string, parentId: string | null }[]>();
                    allCategories.forEach((category: { id: string, name: string, parentId: string | null }) => {
                        if (category.parentId) {
                            if (!categoriesMap.has(category.parentId)) {
                                categoriesMap.set(category.parentId, []);
                            }
                            categoriesMap.get(category.parentId)!.push(category);
                        }
                    });

                    const buildHierarchy = (categoryId: string, categoryName: string): CategoryWithSubcategories => {
                        const children: { id: string, name: string, parentId: string | null }[] = categoriesMap.get(categoryId) || [];
                        return {
                            id: categoryId,
                            name: categoryName,
                            subcategories: children.map((child: { id: string, name: string, parentId: string | null }) => buildHierarchy(child.id, child.name)),
                            hasChildren: children.length > 0
                        };
                    };

                    return [buildHierarchy(parentId, name)];
                };

                const rootCategory: CategoryWithSubcategories = (await getHierarchy(categoryId!, ""))[0];

                const doesCategoryHaveProducts = (category: CategoryWithSubcategories): boolean => {
                    if (categoryIdsWithProducts.has(category.id)) {
                        return true;
                    }

                    for (const subcategory of category.subcategories) {
                        if (doesCategoryHaveProducts(subcategory)) {
                            return true;
                        }
                    }

                    return false;
                };

                const filteredCategories: CategoryWithSubcategories[] = rootCategory.subcategories.filter(doesCategoryHaveProducts);

                availableSubcategories = filteredCategories.map((category: CategoryWithSubcategories) => ({
                    id: category.id,
                    name: category.name,
                    hasChildren: category.hasChildren
                }));
            }
        }

        let filters: FullFilter[] = [
            ...(
                (categoryIdsToFilter.length > 0 || !categoryId) && availableSubcategories.length > 0 ? [{
                    id: "1",
                    name: "Підкатегорії",
                    filterValues: availableSubcategories
                }] : []
            ),
            ...(
                availableManufacturers.length > 0 ? [{
                    id: "2",
                    name: "Виробники",
                    filterValues: availableManufacturers.map((item: { manufacturer: string }) => ({
                        name: item.manufacturer,
                        id: "id_" + item.manufacturer
                    }))
                }] : []
            ),
            // {
            //     id: "3",
            //     name: "Знижки",
            //     filterValues: [
            //         { id: "1", name: "Зі знижкою" },
            //         { id: "2", name: "Без знижки" }
            //     ]
            // }
        ];

        return filters;
    },
}