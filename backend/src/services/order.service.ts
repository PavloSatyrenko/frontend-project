import { Order, OrderItem, OrderStatus, Product, User } from "@prisma/client";
import { orderRepository } from "repositories/order.repositories";

type FullOrderType = Order & {
    orderItems: (Omit<OrderItem, "orderId" | "productId"> & {
        product: Product;
    })[];
};

type OrderPaginationType = {
    orders: FullOrderType[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
};

type InfoOrderType = {
    order_id: number;
    order_total: number;
    delivery_name: string;
    delivery_type: number;
    novaposhta_ttn: string;
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
};

export const orderService = {
    async getOrders(
        page: number,
        pageSize: number,
        period?: "MONTH" | "HALF_YEAR" | "YEAR",
        status?: OrderStatus,
        search?: number
    ): Promise<OrderPaginationType> {
        const { orders, totalCount } = await orderRepository.getOrders(page, pageSize, period, status, search);

        const totalPages: number = Math.ceil(totalCount / pageSize);

        return {
            orders,
            totalCount,
            totalPages,
            page,
            pageSize,
        };
    },

    async getUserOrders(
        userId: string,
        page: number,
        pageSize: number,
        period?: "MONTH" | "HALF_YEAR" | "YEAR",
        search?: number
    ): Promise<OrderPaginationType> {
        const { orders, totalCount } = await orderRepository.getUserOrders(userId, page, pageSize, period, search);

        const totalPages: number = Math.ceil(totalCount / pageSize);

        return {
            orders,
            totalCount,
            totalPages,
            page,
            pageSize,
        };
    },

    async createOrder(
        deliveryMethod: "PICKUP" | "COURIER" | "PARCEL_LOCKER" | "POST_OFFICE",
        deliveryPrice: number,
        paymentMethod: "MANAGER_ONLINE" | "PAYMENT_ON_PICKUP" | "CARD_ON_DELIVERY" | "CASH_ON_DELIVERY",
        orderItems: { productId: string; amount: number }[],
        userId?: string,
        name?: string,
        surname?: string,
        phone?: string,
        email?: string,
        invoice?: string
    ): Promise<void> {
        let user: User | null = userId ? await orderRepository.getUserById(userId) : null;

        if (!user) {
            user = await orderRepository.getUserByPhone(phone!);

            if (user) {
                await orderRepository.updateUser(user.id, name!, surname!, email!);
            }
        }

        if (!user) {
            user = await orderRepository.createGuestUser(name!, surname!, phone!, email!);
        }

        if (!user) {
            throw new Error("User creation failed");
        }

        await orderRepository.createOrder(deliveryMethod, deliveryPrice, paymentMethod, orderItems, user, invoice);

        const productIds: string[] = orderItems.map((item: { productId: string; amount: number }) => item.productId);

        await orderRepository.removeCartItems(user.id, productIds);

        await orderRepository.decreaseProductAmount(orderItems);
    },

    async getOrderInfo(orderNumber: number): Promise<InfoOrderType | null> {
        const order: FullOrderType | null = await orderRepository.getOrderById(orderNumber);

        if (!order) {
            return null;
        }

        let deliveryType: number = 0;
        let deliveryName: string = "";

        switch (order.deliveryMethod) {
            case "PICKUP":
                deliveryType = 1;
                deliveryName = "Самовивіз";
                break;

            case "COURIER":
                deliveryType = 2;
                deliveryName = "НоваПошта - Кур'єр";
                break;

            case "PARCEL_LOCKER":
                deliveryType = 2;
                deliveryName = "НоваПошта - Поштомат";
                break;

            case "POST_OFFICE":
                deliveryType = 2;
                deliveryName = "НоваПошта - Відділення";
                break;

            default:
                deliveryType = 0;
                deliveryName = "Інше";
                break;
        }

        const resultOrder: InfoOrderType = {
            order_id: order.number,
            order_total: order.totalPrice,
            delivery_name: deliveryName,
            delivery_type: deliveryType,
            novaposhta_ttn: order.invoice ?? "",
            user_lastname: order.surname,
            user_firstname: order.name,
            user_telephone: order.phone,
            ordered_items: order.orderItems.map(
                (item: Omit<OrderItem, "orderId" | "productId"> & { product: Product }) => ({
                    name: item.product.name,
                    brand: item.product.manufacturer,
                    articul: item.product.code,
                    quantity: item.amount,
                    price_in: item.price,
                    price_out_basic: item.priceOutBasic,
                    price_out: item.priceOut,
                    supplier: item.product.supplier,
                })
            ),
        };

        return resultOrder;
    },

    async updateOrderStatus(
        orderId: string,
        status: "ACCEPTED" | "PROCESSING" | "PREPARING" | "SENT" | "COMPLETED" | "CANCELLED"
    ): Promise<void> {
        await orderRepository.updateOrderStatus(orderId, status);
    },
};
