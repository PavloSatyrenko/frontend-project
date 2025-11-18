import { CartItem, PrismaClient, Product } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const cartRepository = {
    async getShoppingCart(userId: string): Promise<(CartItem & { product: Product & { favoriteUserProducts?: {}[] } })[]> {
        return await prisma.cartItem.findMany({
            where: {
                userId: userId
            },
            include: {
                product: {
                    include: {
                        favoriteUserProducts: {
                            where: {
                                userId: userId
                            }
                        }
                    }
                }
            }
        });
    },

    async getCartItemByUserAndProduct(userId: string, productId: string): Promise<CartItem | null> {
        return await prisma.cartItem.findFirst({
            where: {
                userId: userId,
                productId: productId
            }
        });
    },

    async getProductAmountById(productId: string): Promise<number> {
        return await prisma.product.findUnique({
            where: {
                id: productId
            },
            select: {
                amount: true
            }
        }).then((product: { amount: number } | null) => product ? product.amount : 0);
    },

    async addCartItem(userId: string, productId: string, amount?: number, isChecked?: boolean): Promise<CartItem> {
        return await prisma.cartItem.create({
            data: {
                userId: userId,
                productId: productId,
                amount: amount,
                isChecked: isChecked
            }
        });
    },

    async toggleCartItems(userId: string, isChecked: boolean): Promise<void> {
        await prisma.cartItem.updateMany({
            where: {
                userId: userId
            },
            data: {
                isChecked: isChecked
            }
        });
    },

    async getCartItemById(cartItemId: string): Promise<CartItem | null> {
        return await prisma.cartItem.findUnique({
            where: {
                id: cartItemId
            }
        });
    },

    async removeFromCart(cartItemId: string): Promise<void> {
        await prisma.cartItem.delete({
            where: {
                id: cartItemId
            }
        });
    },

    async updateCartItem(cartItemId: string, amount: number, isChecked: boolean): Promise<void> {
        await prisma.cartItem.update({
            where: {
                id: cartItemId
            },
            data: {
                amount: amount,
                isChecked: isChecked
            }
        });
    },

    async getProductsByIds(productIds: string[]): Promise<Product[]> {
        return await prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            }
        });
    }
};
