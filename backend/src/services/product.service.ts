import { Analog, Availability, Product } from "@prisma/client";
import { productRepository } from "repositories/product.repository";

type FullProductType = Product & { isFavorite: boolean };

type ProductPaginationType = {
    products: FullProductType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
    maxPrice: number | null;
}

type FullAnalogType = Analog & { product: Product, analogProduct: Product };

export const productService = {
    async getProducts(
        page: number,
        pageSize: number,
        sort: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc",
        categoryId?: string,
        subcategoryIds?: string[],
        minPriceValue?: number,
        maxPriceValue?: number,
        manufacturers?: string[],
        discounts?: string[],
        availability?: Availability[],
        search?: string,
        userId?: string
    ): Promise<ProductPaginationType> {
        let isDiscounted: boolean | undefined = undefined;

        if (discounts && discounts.length === 1) {
            if (discounts[0] === "Зі знижкою") {
                isDiscounted = true;
            }
            else if (discounts[0] === "Без знижки") {
                isDiscounted = false;
            }
        }

        const { products, totalCount, maxPrice } = await productRepository.getProductsWithCount(page, pageSize, sort, categoryId, subcategoryIds, minPriceValue, maxPriceValue, manufacturers, isDiscounted, availability, search, userId);

        const resultProducts: FullProductType[] = products.map((product: Product & { favoriteUserProducts?: {}[] }) => {
            const { favoriteUserProducts, ...productWithoutFavorites } = product;

            return {
                ...productWithoutFavorites,
                isFavorite: !!(favoriteUserProducts && favoriteUserProducts.length > 0)
            };
        });

        const totalPages: number = Math.ceil(totalCount / pageSize);

        return {
            products: resultProducts,
            totalCount,
            totalPages,
            page,
            pageSize,
            maxPrice
        };
    },

    async getProductById(productId: string, userId?: string): Promise<FullProductType | null> {
        const product: (Product & { favoriteUserProducts: {}[] }) | null = await productRepository.getProductById(productId, userId);

        if (!product) {
            return null;
        }

        const { favoriteUserProducts, ...productWithoutFavorites } = product;

        return {
            ...productWithoutFavorites,
            isFavorite: !!(favoriteUserProducts && favoriteUserProducts.length > 0)
        };
    },

    async updateProduct(productId: string, discount: number, isRecommended: boolean, analogIds: string[]): Promise<void> {
        await productRepository.updateProduct(productId, discount, isRecommended, analogIds);
    },

    async getProductAnalogs(productId: string): Promise<Product[]> {
        const analogs: FullAnalogType[] = await productRepository.getProductAnalogs(productId);

        return analogs.map((analog: FullAnalogType) => analog.productId === productId ? analog.analogProduct : analog.product);
    },

    async getRecommendedProducts(userId?: string): Promise<FullProductType[]> {
        const recommendedProducts: (Product & { favoriteUserProducts?: {}[] })[] = await productRepository.getRecommendedProducts(userId);

        return recommendedProducts.map((product: Product & { favoriteUserProducts?: {}[] }) => {
            const { favoriteUserProducts, ...productWithoutFavorites } = product;

            return {
                ...productWithoutFavorites,
                isFavorite: !!(favoriteUserProducts && favoriteUserProducts.length > 0)
            };
        });
    },

    async getFavoriteProducts(userId: string, sort: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc"): Promise<FullProductType[]> {
        const favoriteProducts: (Product & { favoriteUserProducts: {}[] })[] = await productRepository.getFavoriteProducts(userId, sort);

        return favoriteProducts.map((product: (Product & { favoriteUserProducts: {}[] })) => {
            const { favoriteUserProducts, ...productWithoutFavorites } = product;

            return {
                ...productWithoutFavorites,
                isFavorite: !!(favoriteUserProducts && favoriteUserProducts.length > 0)
            };
        });
    },

    async addProductToFavorites(userId: string, productId: string): Promise<void> {
        await productRepository.addProductToFavorites(userId, productId);
    },

    async removeProductFromFavorites(userId: string, productId: string): Promise<void> {
        await productRepository.removeProductFromFavorites(userId, productId);
    },

    async getOfflineFavoriteProducts(productIds: string[], userId?: string): Promise<FullProductType[]> {
        const products: (Product & { favoriteUserProducts?: {}[] })[] = await productRepository.getProductsByIds(productIds, userId);

        return products.map((product: Product & { favoriteUserProducts?: {}[] }) => {
            const { favoriteUserProducts, ...productWithoutFavorites } = product;

            return {
                ...productWithoutFavorites,
                isFavorite: false
            };
        });
    },

    async setOfflineFavoriteProducts(userId: string, productIds: string[]): Promise<void> {
        for (const productId of productIds) {
            const product: (Product & { favoriteUserProducts: {}[] }) | null = await productRepository.getProductById(productId, userId);

            if (product) {
                await productRepository.addProductToFavorites(userId, productId);
            }
        }
    }
};
