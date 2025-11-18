import { CartItem, Product } from "@prisma/client";
import { cartRepository } from "repositories/cart.repository";
import { v4 as uuidv4 } from "uuid";

type FullProductType = Product & { favoriteUserProducts?: {}[] };
type CartItemWithProduct = CartItem & { product: FullProductType };
type FullCartItem = CartItem & { product: Product & { isFavorite: boolean }, totalPrice: number };
type OfflineCartItem = { productId: string, amount: number, isChecked: boolean };

export const cartService = {
    async getShoppingCart(userId: string): Promise<FullCartItem[]> {
        const cart: CartItemWithProduct[] = await cartRepository.getShoppingCart(userId);

        return cart.map((cartItem: CartItemWithProduct) => {
            const { favoriteUserProducts, ...productWithoutFavorites } = cartItem.product;

            return {
                ...cartItem,
                product: {
                    ...productWithoutFavorites,
                    isFavorite: !!(favoriteUserProducts && favoriteUserProducts.length > 0)
                },
                totalPrice: cartItem.amount * cartItem.product.price
            }
        });
    },

    async addToCart(userId: string, productId: string): Promise<CartItem | null> {
        const existingCartItem: CartItem | null = await cartRepository.getCartItemByUserAndProduct(userId, productId);

        if (!existingCartItem) {
            return await cartRepository.addCartItem(userId, productId);
        }
        else {
            return null;
        }
    },

    async addMultipleToCart(userId: string, productIds: string[]): Promise<void> {
        for (const productId of productIds) {
            const existingCartItem: CartItem | null = await cartRepository.getCartItemByUserAndProduct(userId, productId);

            if (!existingCartItem) {
                await cartRepository.addCartItem(userId, productId);
            }
        }
    },

    async toggleCart(userId: string, isChecked: boolean): Promise<void> {
        await cartRepository.toggleCartItems(userId, isChecked);
    },

    async getCartItemById(cartItemId: string): Promise<CartItem | null> {
        return await cartRepository.getCartItemById(cartItemId);
    },

    async getProductAmount(productId: string): Promise<number> {
        return await cartRepository.getProductAmountById(productId);
    },

    async removeFromCart(cartItemId: string): Promise<void> {
        await cartRepository.removeFromCart(cartItemId);
    },

    async updateCartItem(cartItemId: string, amount: number, isChecked: boolean): Promise<void> {
        await cartRepository.updateCartItem(cartItemId, amount, isChecked);
    },

    async getOfflineCart(cartItems: OfflineCartItem[]): Promise<FullCartItem[]> {
        const productIds: string[] = cartItems.map((item: OfflineCartItem) => item.productId);

        const products: Product[] = await cartRepository.getProductsByIds(productIds);

        return cartItems.map((item: OfflineCartItem) => {
            const product: Product & { isFavorite: boolean } = {
                ...products.find((productItem: Product) => productItem.id === item.productId)!,
                isFavorite: false
            };

            return {
                ...item,
                id: uuidv4(),
                userId: "0",
                product: product,
                totalPrice: item.amount * product.price,
            };
        });
    },

    async setOfflineCart(userId: string, cartItems: OfflineCartItem[]): Promise<void> {
        for (const item of cartItems) {
            const existingCartItem: CartItem | null = await cartRepository.getCartItemByUserAndProduct(userId, item.productId);

            if (existingCartItem) {
                await cartRepository.updateCartItem(existingCartItem.id, item.amount, item.isChecked);
            }
            else {
                await cartRepository.addCartItem(userId, item.productId, item.amount, item.isChecked);
            }
        }
    }
}