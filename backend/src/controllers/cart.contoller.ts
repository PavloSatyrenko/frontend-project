import { CartItem, Product } from "@prisma/client";
import { Request, Response } from "express";
import { cartService } from "services/cart.service";

type FullCartItem = CartItem & { product: Product, totalPrice: number };
type OfflineCartItem = { productId: string, amount: number, isChecked: boolean };

export const cartController = {
    async getShoppingCart(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;

            const cartItems: FullCartItem[] = await cartService.getShoppingCart(userId);

            response.status(200).json(cartItems);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async addToCart(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;
            const productId: string = request.body.productId;

            const newCartItem: CartItem | null = await cartService.addToCart(userId, productId);

            if (newCartItem) {
                response.status(201).json({ message: "Product added to cart", cartItem: newCartItem });
            }
            else {
                response.status(400).json({ message: "Product already in cart" });
            }
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async addMultipleToCart(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;
            const productIds: string[] = request.body.productIds;

            await cartService.addMultipleToCart(userId, productIds);

            response.status(201).json({ message: "Products added to cart" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async toggleCart(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;
            const isChecked: boolean = request.body.isChecked;

            await cartService.toggleCart(userId, isChecked);

            response.status(200).json({ message: "Cart items updated" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async removeFromCart(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;
            const cartItemId: string = request.params.id;

            const cartItem: CartItem | null = await cartService.getCartItemById(cartItemId);

            if (!cartItem || cartItem.userId !== userId) {
                response.status(404).json({ message: "Cart item not found" });
            }
            else {
                await cartService.removeFromCart(cartItemId);

                response.status(200).json({ message: "Product removed from cart" });
            }
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async updateCartItem(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;
            const cartItemId: string = request.params.id;
            const amount: number = request.body.amount;
            const isChecked: boolean = request.body.isChecked;

            const cartItem: CartItem | null = await cartService.getCartItemById(cartItemId);

            if (!cartItem || cartItem.userId !== userId) {
                response.status(404).json({ message: "Cart item not found" });
                return;
            }

            const productAmount: number = await cartService.getProductAmount(cartItem.productId);

            if (amount > productAmount) {
                response.status(400).json({ message: `Only ${productAmount} items available in stock` });
                return;
            }

            await cartService.updateCartItem(cartItemId, amount, isChecked);

            response.status(200).json({ message: "Cart item updated" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async getOfflineCart(request: Request, response: Response): Promise<void> {
        try {
            const cartItems: OfflineCartItem[] = request.body.cartItems;

            const resultCartItems: FullCartItem[] = await cartService.getOfflineCart(cartItems);

            response.status(200).json(resultCartItems);
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    },

    async setOfflineCart(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;
            const cartItems: OfflineCartItem[] = request.body.cartItems;

            await cartService.setOfflineCart(userId, cartItems);

            response.status(200).json({ message: "Offline cart merged successfully" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
            throw error;
        }
    }
}