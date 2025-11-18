import { Availability, Product } from "@prisma/client";
import { Request, Response } from "express";
import { productService } from "services/product.service";

type FullProductType = Product & { isFavorite: boolean };

type ProductPaginationType = {
    products: FullProductType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
    maxPrice: number | null;
};

export const productController = {
    async getProducts(request: Request, response: Response): Promise<void> {
        try {
            const userId: string | undefined = request.user ? request.user.id : undefined;

            const page: number = parseInt(request.query.page as string) || 1;
            const pageSize: number = parseInt(request.query.pageSize as string) || 20;
            const sort: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc" = request.query.sort as "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";
            const categoryId: string | undefined = request.query.categoryId ? request.query.categoryId as string : undefined;
            const subcategoryIds: string[] | undefined = request.query.subcategoryIds ? (Array.isArray(request.query.subcategoryIds) ? request.query.subcategoryIds : [request.query.subcategoryIds]) as string[] : undefined;
            const minPrice: number | undefined = request.query.minPrice ? Number(request.query.minPrice) : undefined;
            const maxPrice: number | undefined = request.query.maxPrice ? Number(request.query.maxPrice) : undefined;
            const manufacturers: string[] | undefined = request.query.manufacturers ? (Array.isArray(request.query.manufacturers) ? request.query.manufacturers : [request.query.manufacturers]) as string[] : undefined;
            const discounts: string[] | undefined = request.query.discounts ? (Array.isArray(request.query.discounts) ? request.query.discounts : [request.query.discounts]) as string[] : undefined;
            const availability: Availability[] | undefined = request.query.availability ? (Array.isArray(request.query.availability) ? request.query.availability : [request.query.availability]) as Availability[] : undefined;
            const search: string | undefined = request.query.search ? request.query.search as string : undefined;

            const products: ProductPaginationType = await productService.getProducts(page, pageSize, sort, categoryId, subcategoryIds, minPrice, maxPrice, manufacturers, discounts, availability, search, userId);
            response.status(200).json(products);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async getProductById(request: Request, response: Response): Promise<void> {
        try {
            const userId: string | undefined = request.user ? request.user.id : undefined;

            const productId: string = request.params.id;

            const product: FullProductType | null = await productService.getProductById(productId, userId);

            if (product) {
                response.status(200).json(product);
            }
            else {
                response.status(404).json({ message: "Product not found" });
            }
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async updateProduct(request: Request, response: Response): Promise<void> {
        try {
            const productId: string = request.params.id;
            const discount: number = request.body.discount;
            const isRecommended: boolean = request.body.isRecommended;
            const analogIds: string[] = request.body.analogIds;

            await productService.updateProduct(productId, discount, isRecommended, analogIds);

            response.status(204).send();
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async getProductAnalogs(request: Request, response: Response): Promise<void> {
        try {
            const productId: string = request.params.id;

            const analogs: Product[] = await productService.getProductAnalogs(productId);

            response.status(200).json(analogs);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async getRecommendedProducts(request: Request, response: Response): Promise<void> {
        try {
            const userId: string | undefined = request.user ? request.user.id : undefined;

            const recommendedProducts: FullProductType[] = await productService.getRecommendedProducts(userId);

            response.status(200).json(recommendedProducts);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async getFavoriteProducts(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;

            const sort: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc" = request.query.sort as "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";

            const favoriteProducts: FullProductType[] = await productService.getFavoriteProducts(userId, sort);

            response.status(200).json(favoriteProducts);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async addProductToFavorites(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;

            const productId: string = request.params.id;

            const product: FullProductType | null = await productService.getProductById(productId, userId);

            if (product) {
                if (product.isFavorite) {
                    response.status(204).send();
                    return;
                }

                await productService.addProductToFavorites(userId, productId);

                response.status(204).send();
            }
            else {
                response.status(404).json({ message: "Product not found" });
            }
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async removeProductFromFavorites(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;

            const productId: string = request.params.id;

            const product: FullProductType | null = await productService.getProductById(productId, userId);

            if (product) {
                if (!product.isFavorite) {
                    response.status(204).send();
                    return;
                }

                await productService.removeProductFromFavorites(userId, productId);

                response.status(204).send();
            }
            else {
                response.status(404).json({ message: "Product not found" });
            }
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async getOfflineFavoriteProducts(request: Request, response: Response): Promise<void> {
        try {
            const productIds: string[] = request.body.productIds;

            const products: FullProductType[] = await productService.getOfflineFavoriteProducts(productIds);

            response.status(200).json(products);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async setOfflineFavoriteProducts(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;
            const productIds: string[] = request.body.productIds;

            await productService.setOfflineFavoriteProducts(userId, productIds);

            response.status(200).send({ message: "Offline favorite products merged successfully" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    }
};