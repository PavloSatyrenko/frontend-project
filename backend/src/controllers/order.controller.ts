import { Order, OrderItem, OrderStatus, Product } from "@prisma/client";
import { Request, Response } from "express";
import { orderService } from "services/order.service";

type FullOrderType = Order & {
    orderItems: (Omit<OrderItem, "orderId" | "productId"> & {
        product: Product;
    })[];
}

type OrderPaginationType = {
    orders: FullOrderType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
}

type InfoOrderType = {
    order_id: number;
    order_total: number;
    delivery_name: string;
    delivery_type: number;
    user_lastname: string;
    user_firstname: string;
    user_telephone: string;
    ordered_items: {
        name: string;
        brand: string;
        articul: string;
        quantity: number;
        price_in: number;
        price_out_basic: number;
        price_out: number;
        supplier: string;
    }[];
}

export const orderController = {
    async getOrders(request: Request, response: Response): Promise<void> {
        try {
            const page: number = parseInt(request.query.page as string) || 1;
            const pageSize: number = parseInt(request.query.pageSize as string) || 10;
            const period: "MONTH" | "HALF_YEAR" | "YEAR" | undefined = request.query.period as "MONTH" | "HALF_YEAR" | "YEAR" | undefined;
            const status: OrderStatus | undefined = request.query.status as OrderStatus | undefined;
            const search: number | undefined = request.query.search ? Number(request.query.search) : undefined;

            const orders: OrderPaginationType = await orderService.getOrders(page, pageSize, period, status, search);

            response.status(200).json(orders);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async getUserOrders(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.user!.id;

            const page: number = parseInt(request.query.page as string) || 1;
            const pageSize: number = parseInt(request.query.pageSize as string) || 10;
            const period: "MONTH" | "HALF_YEAR" | "YEAR" | undefined = request.query.period as "MONTH" | "HALF_YEAR" | "YEAR" | undefined;
            const search: number | undefined = request.query.search ? Number(request.query.search) : undefined;

            const orders: OrderPaginationType = await orderService.getUserOrders(userId, page, pageSize, period, search);

            response.status(200).json(orders);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async getUserOrdersAdmin(request: Request, response: Response): Promise<void> {
        try {
            const userId: string = request.params.userId;

            const page: number = parseInt(request.query.page as string) || 1;
            const pageSize: number = parseInt(request.query.pageSize as string) || 10;

            const orders: OrderPaginationType = await orderService.getUserOrders(userId, page, pageSize);

            response.status(200).json(orders);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async createOrder(request: Request, response: Response): Promise<void> {
        try {
            const userId: string | undefined = request.user?.id;
            const name: string | undefined = request.body.name;
            const surname: string | undefined = request.body.surname;
            const phone: string | undefined = request.body.phone;
            const email: string | undefined = request.body.email;
            const deliveryMethod: "PICKUP" | "COURIER" | "PARCEL_LOCKER" | "POST_OFFICE" = request.body.deliveryMethod;
            const deliveryPrice: number = request.body.deliveryPrice;
            const paymentMethod: "MANAGER_ONLINE" | "PAYMENT_ON_PICKUP" | "CARD_ON_DELIVERY" | "CASH_ON_DELIVERY" = request.body.paymentMethod;
            const orderItems: { productId: string; amount: number }[] = request.body.orderItems;
            const invoice: string | undefined = request.body.invoice;

            await orderService.createOrder(deliveryMethod, deliveryPrice, paymentMethod, orderItems, userId, name, surname, phone, email, invoice);

            response.status(201).json({ message: "Order created successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async getOrderInfo(request: Request, response: Response): Promise<void> {
        try {
            const orderNumber: number = parseInt(request.params.orderNumber);

            const order: InfoOrderType | null = await orderService.getOrderInfo(orderNumber);

            if (!order) {
                response.status(404).json({ message: "Order not found" });
                return;
            }

            response.status(200).json(order);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateOrderStatus(request: Request, response: Response): Promise<void> {
        try {
            const orderId: string = request.params.orderId;
            const status: OrderStatus = request.body.status;

            await orderService.updateOrderStatus(orderId, status);

            response.status(200).json({ message: "Order status updated successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },
};