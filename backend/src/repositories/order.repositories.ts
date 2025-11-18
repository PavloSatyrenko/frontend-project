import { Order, OrderItem, OrderStatus, PrismaClient, Product, User } from "@prisma/client";
import { AUTOSELLING_ORDER_URL } from "config/env";

type FullOrderType = Order & {
    orderItems: (Omit<OrderItem, "orderId" | "productId"> & {
        product: Product;
    })[];
}

const prisma: PrismaClient = new PrismaClient();

export const orderRepository = {
    async getOrders(page: number, pageSize: number, period?: "MONTH" | "HALF_YEAR" | "YEAR", status?: OrderStatus, search?: number): Promise<{ orders: FullOrderType[], totalCount: number }> {
        const lastOrder: { number: number } | null = await prisma.order.findFirst({
            orderBy: {
                number: "desc"
            },
            select: {
                number: true
            }
        });

        if (!lastOrder) {
            return { orders: [], totalCount: 0 };
        }

        const lastNumber: number = lastOrder.number;

        const generateNumbersEndingWith = (endsWith: number): number[] => {
            const endsWithString: string = endsWith.toString();

            const result: number[] = [];

            for (let i = +endsWithString; i <= lastNumber; i += Math.pow(10, endsWithString.length)) {
                result.push(i);
            }

            return result;
        };

        const whereStatement = {
            ...(
                (search || search == 0) && {
                    number: {
                        in: generateNumbersEndingWith(search)
                    }
                }
            ),
            ...(
                status && {
                    status: status
                }
            ),
            ...(
                period && {
                    date: {
                        gte: ((): Date => {
                            const now: Date = new Date();

                            switch (period) {
                                case "MONTH":
                                    now.setMonth(now.getMonth() - 1);
                                    break;
                                case "HALF_YEAR":
                                    now.setMonth(now.getMonth() - 6);
                                    break;
                                case "YEAR":
                                    now.setFullYear(now.getFullYear() - 1);
                                    break;
                            }

                            return now;
                        })()
                    }
                }
            )
        };

        const [orders, { _count: totalCount }] = await Promise.all([
            prisma.order.findMany({
                where: whereStatement,
                include: {
                    orderItems: {
                        omit: {
                            orderId: true,
                            productId: true
                        },
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: {
                    date: "desc"
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),

            prisma.order.aggregate({
                where: whereStatement,
                _count: true
            })
        ]);

        return {
            orders,
            totalCount
        };
    },

    async getUserOrders(userId: string, page: number, pageSize: number, period?: "MONTH" | "HALF_YEAR" | "YEAR", search?: number): Promise<{ orders: FullOrderType[], totalCount: number }> {
        const lastOrder: { number: number } | null = await prisma.order.findFirst({
            orderBy: {
                number: "desc"
            },
            select: {
                number: true
            }
        });

        if (!lastOrder) {
            return { orders: [], totalCount: 0 };
        }

        const lastNumber: number = lastOrder.number;

        const generateNumbersEndingWith = (endsWith: number): number[] => {
            const endsWithString: string = endsWith.toString();

            const result: number[] = [];

            for (let i = +endsWithString; i <= lastNumber; i += Math.pow(10, endsWithString.length)) {
                result.push(i);
            }

            return result;
        };

        const whereStatement = {
            userId: userId,
            ...(
                (search || search == 0) && {
                    number: {
                        in: generateNumbersEndingWith(search)
                    }
                }
            ),
            ...(
                period && {
                    createdAt: {
                        gte: ((): Date => {
                            const now: Date = new Date();

                            switch (period) {
                                case "MONTH":
                                    now.setMonth(now.getMonth() - 1);
                                    break;
                                case "HALF_YEAR":
                                    now.setMonth(now.getMonth() - 6);
                                    break;
                                case "YEAR":
                                    now.setFullYear(now.getFullYear() - 1);
                                    break;
                            }

                            return now;
                        })()
                    }
                }
            )
        };

        const [orders, { _count: totalCount }] = await Promise.all([
            prisma.order.findMany({
                where: whereStatement,
                include: {
                    orderItems: {
                        omit: {
                            orderId: true,
                            productId: true
                        },
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: {
                    date: "desc"
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),

            prisma.order.aggregate({
                where: whereStatement,
                _count: true
            })
        ]);

        return {
            orders,
            totalCount
        };
    },

    async getUserById(userId: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
    },

    async getUserByPhone(phone: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                phone: phone
            }
        });
    },

    async updateUser(userId: string, name: string, surname: string, email: string): Promise<void> {
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name: name,
                surname: surname,
                email: email
            }
        });
    },

    async createGuestUser(name: string, surname: string, phone: string, email: string): Promise<User> {
        return await prisma.user.create({
            data: {
                name: name,
                surname: surname,
                phone: phone,
                email: email,
                role: "RETAIL",
                isRegistered: false
            }
        });
    },

    async createOrder(
        deliveryMethod: "PICKUP" | "COURIER" | "PARCEL_LOCKER" | "POST_OFFICE",
        deliveryPrice: number,
        paymentMethod: "MANAGER_ONLINE" | "PAYMENT_ON_PICKUP" | "CARD_ON_DELIVERY" | "CASH_ON_DELIVERY",
        orderItems: { productId: string; amount: number }[],
        user: User,
        invoice?: string
    ): Promise<void> {
        const productIds: string[] = orderItems.map((item: { productId: string, amount: number }) => item.productId);

        const productPrices: { id: string, price: number, discount: number }[] = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            select: {
                id: true,
                price: true,
                discount: true
            }
        });

        const priceMarkupValue: { value: string } | null = await prisma.config.findUnique({
            where: {
                key: user.role
            },
            select: {
                value: true
            }
        });

        const priceMarkup: number = priceMarkupValue ? parseFloat(priceMarkupValue.value) : 0;

        const priceMap: Map<string, [number, number, number]> = new Map(productPrices.map((product: { id: string, price: number, discount: number }) => [product.id, [product.price, product.price * (1 + priceMarkup / 100), product.price * (1 + priceMarkup / 100) * (1 - product.discount / 100)]]));

        const productsTotalPrice: number = orderItems.reduce((sum: number, item: { productId: string; amount: number }) => {
            const price: number = priceMap.get(item.productId)?.[2] ?? 0;
            return sum + price * item.amount;
        }, 0);

        const productsAmount: number = orderItems.reduce((sum: number, item: { productId: string; amount: number }) => {
            return sum + item.amount;
        }, 0);

        const { number: orderNumber }: { number: number } = await prisma.order.create({
            data: {
                deliveryMethod: deliveryMethod,
                deliveryPrice: deliveryPrice,
                paymentMethod: paymentMethod,
                userId: user.id,
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                email: user.email,
                invoice: invoice,
                orderItems: {
                    create: orderItems.map((item: { productId: string; amount: number }) => ({
                        productId: item.productId,
                        amount: item.amount,
                        price: priceMap.get(item.productId)?.[0] ?? 0,
                        priceOutBasic: priceMap.get(item.productId)?.[1] ?? 0,
                        priceOut: priceMap.get(item.productId)?.[2] ?? 0
                    }))
                },
                productsPrice: productsTotalPrice,
                productsAmount: productsAmount,
                totalPrice: deliveryPrice + productsTotalPrice
            }
        });

        // fetch(AUTOSELLING_ORDER_URL + orderNumber, {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json"
        //     }
        // });
    },

    async removeCartItems(userId: string, productIds: string[]): Promise<void> {
        await prisma.cartItem.deleteMany({
            where: {
                userId: userId,
                productId: {
                    in: productIds
                }
            }
        });
    },

    async decreaseProductAmount(orderItems: { productId: string; amount: number }[]): Promise<void> {
        for (const item of orderItems) {
            await prisma.product.update({
                where: {
                    id: item.productId
                },
                data: {
                    amount: {
                        decrement: item.amount
                    }
                }
            });
        }

        const productIds: string[] = orderItems.map((item: { productId: string; amount: number }) => item.productId);

        await prisma.product.updateMany({
            where: {
                id: {
                    in: productIds
                },
                amount: 0
            },
            data: {
                isActive: false,
                availability: "NOT_AVAILABLE"
            }
        });
    },

    async getOrderById(orderNumber: number): Promise<FullOrderType | null> {
        return await prisma.order.findUnique({
            where: {
                number: orderNumber
            },
            include: {
                orderItems: {
                    omit: {
                        orderId: true,
                        productId: true
                    },
                    include: {
                        product: true
                    }
                }
            }
        });
    },

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                status: status
            }
        });
    }
}