import { Analog, Availability, PrismaClient, Product } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const productRepository = {
    async getProductsWithCount(
        page: number,
        pageSize: number,
        sort: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc",
        categoryId?: string,
        subcategoryIds?: string[],
        minPriceValue?: number,
        maxPriceValue?: number,
        manufacturers?: string[],
        isDiscounted?: boolean,
        availability?: Availability[],
        search?: string,
        userId?: string
    ): Promise<{ products: (Product & { favoriteUserProducts: {}[] })[], totalCount: number, maxPrice: number | null }> {
        const words: string[] = search?.split(/\s+/).filter(Boolean) ?? [];

        const getAllSubcategoryIds = async (parentId: string): Promise<string[]> => {
            const categoryIds: string[] = [parentId];

            const subcategories: { id: string }[] = await prisma.category.findMany({
                where: {
                    parentId: parentId
                },
                select: {
                    id: true
                }
            });

            for (const subcategory of subcategories) {
                const childIds: string[] = await getAllSubcategoryIds(subcategory.id);
                categoryIds.push(...childIds);
            }

            return categoryIds;
        };

        let categoryIdsToFilter: string[] = [];
        if (subcategoryIds && subcategoryIds.length > 0) {
            categoryIdsToFilter = (await Promise.all(subcategoryIds.map(async (subcategoryId: string) => {
                return await getAllSubcategoryIds(subcategoryId);
            }))).flat();
        }
        else if (categoryId) {
            categoryIdsToFilter = await getAllSubcategoryIds(categoryId);
        }

        const baseWhereStatement = {
            ...(
                categoryIdsToFilter.length > 0 && {
                    categoryIds: {
                        hasSome: categoryIdsToFilter
                    }
                }
            ),
            ...(
                manufacturers && manufacturers.length > 0 && {
                    manufacturer: {
                        in: manufacturers
                    }
                }
            ),
            ...(
                isDiscounted !== undefined && {
                    discount: isDiscounted ? { gt: 0 } : 0
                }
            ),
            ...(
                availability && availability.length > 0 && {
                    availability: {
                        in: availability
                    }
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
            )
        };

        const whereWithPrice = {
            ...baseWhereStatement,
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

        let sortOrder: { [key: string]: "asc" | "desc" } = { name: "asc" };

        if (sort === "priceAsc") {
            sortOrder = { price: "asc" };
        }
        else if (sort === "priceDesc") {
            sortOrder = { price: "desc" };
        }
        else if (sort === "nameAsc") {
            sortOrder = { name: "asc" };
        }
        else if (sort === "nameDesc") {
            sortOrder = { name: "desc" };
        }

        const [products, { _count: totalCount }, { _max: { price: maxPrice } }] = await Promise.all([
            prisma.product.findMany({
                where: whereWithPrice,
                orderBy: [
                    {
                        availability: "asc"
                    },
                    sortOrder
                ],
                include: {
                    favoriteUserProducts: {
                        where: {
                            userId: userId
                        }
                    }
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),

            prisma.product.aggregate({
                where: whereWithPrice,
                _count: true
            }),

            prisma.product.aggregate({
                where: baseWhereStatement,
                _max: {
                    price: true
                }
            })
        ]);

        return {
            products,
            totalCount,
            maxPrice
        };
    },

    async getProductById(productId: string, userId?: string): Promise<(Product & { favoriteUserProducts: {}[] }) | null> {
        return await prisma.product.findUnique({
            where: {
                id: productId
            },
            include: {
                favoriteUserProducts: {
                    where: {
                        userId: userId
                    }
                }
            }
        });
    },

    async updateProduct(productId: string, discount: number, isRecommended: boolean, analogIds: string[]): Promise<void> {
        await prisma.analog.deleteMany({
            where: {
                OR: [
                    { productId: productId },
                    { analogProductId: productId }
                ]
            }
        });

        if (analogIds.length > 0) {
            await prisma.analog.createMany({
                data: analogIds.map((analogId: string) => ({
                    productId: productId < analogId ? productId : analogId,
                    analogProductId: productId < analogId ? analogId : productId
                })),
                skipDuplicates: true
            });
        }

        await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                discount,
                isRecommended
            }
        });
    },

    async getProductAnalogs(productId: string): Promise<(Analog & { product: Product, analogProduct: Product })[]> {
        return await prisma.analog.findMany({
            where: {
                OR: [
                    {
                        productId: productId
                    },
                    {
                        analogProductId: productId
                    }
                ]
            },
            include: {
                product: true,
                analogProduct: true
            }
        })
    },



    async getRecommendedProducts(userId?: string): Promise<(Product & { favoriteUserProducts?: {}[] })[]> {
        return await prisma.product.findMany({
            where: {
                isRecommended: true
            },
            include: {
                favoriteUserProducts: {
                    where: {
                        userId: userId
                    }
                }
            }
        });
    },

    async getFavoriteProducts(userId: string, sort: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc"): Promise<(Product & { favoriteUserProducts: {}[] })[]> {
        let sortOrder: { [key: string]: "asc" | "desc" } = { name: "asc" };

        if (sort === "priceAsc") {
            sortOrder = { price: "asc" };
        }
        else if (sort === "priceDesc") {
            sortOrder = { price: "desc" };
        }
        else if (sort === "nameAsc") {
            sortOrder = { name: "asc" };
        }
        else if (sort === "nameDesc") {
            sortOrder = { name: "desc" };
        }


        return await prisma.product.findMany({
            where: {
                favoriteUserProducts: {
                    some: {
                        userId: userId
                    }
                }
            },
            orderBy: sortOrder,
            include: {
                favoriteUserProducts: {
                    where: {
                        userId: userId
                    }
                }
            }
        });
    },

    async addProductToFavorites(userId: string, productId: string): Promise<void> {
        await prisma.favoriteUserProduct.create({
            data: {
                userId,
                productId
            }
        });
    },

    async removeProductFromFavorites(userId: string, productId: string): Promise<void> {
        await prisma.favoriteUserProduct.deleteMany({
            where: {
                userId,
                productId
            }
        });
    },

    async getProductsByIds(productIds: string[], userId?: string): Promise<(Product & { favoriteUserProducts?: {}[] })[]> {
        return await prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            orderBy: {
                name: "asc"
            },
            include: {
                favoriteUserProducts: {
                    where: {
                        userId: userId
                    }
                }
            }
        });
    }
};