import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { DeliveryMethodEnum } from "@shared/types/DeliveryMethodEnum";
import { OrderRequestType } from "@shared/types/OrderRequestType";
import { OrderResponseType } from "@shared/types/OrderResponseType";
import { PaymentMethodEnum } from "@shared/types/PaymentMethodEnum";
import {
    firstValueFrom,
    lastValueFrom,
    map,
    mergeMap,
    Observable,
    shareReplay,
    Subject,
    Subscriber,
    Subscription,
    switchMap,
} from "rxjs";
import { CartService } from "./cart.service";
import { OrderType } from "@shared/types/OrderType";
import { OrderStatusEnum } from "@shared/types/OrderStatusEnum";
import { NovaPoshtaService } from "./nova-poshta.service";
import { NPResponseType } from "@shared/types/NPResponseType";
import { NPTrackingResponseType } from "@shared/types/NPTrackingResponseType";

@Injectable({
    providedIn: "root",
})
export class OrdersService {
    public ordersRequest: WritableSignal<OrderRequestType> = signal<OrderRequestType>({
        page: 1,
        pageSize: 10,
    });

    public ordersResponse: WritableSignal<OrderResponseType> = signal<OrderResponseType>({
        orders: [],
        totalCount: 0,
        totalPages: 0,
        page: 1,
        pageSize: 10,
    });

    private httpClient: HttpClient = inject(HttpClient);
    private cartService: CartService = inject(CartService);
    private novaPoshtaService: NovaPoshtaService = inject(NovaPoshtaService);

    private requestSubject = new Subject<{ options: OrderRequestType; hasToUpdateResponse: boolean; url: string }>();

    private orders$: Observable<OrderResponseType> = this.requestSubject.pipe(
        switchMap(({ options, hasToUpdateResponse, url }) => {
            return this.httpClient.get<OrderResponseType>(environment.serverURL + url, { params: options }).pipe(
                mergeMap(async (response: OrderResponseType) => {
                                console.log(response);
                    response.orders = await Promise.all(
                        response.orders.map(async (order: OrderType) => {
                            console.log(order);
                            if (order.status === OrderStatusEnum.Sent && order.invoice) {
                                console.log("DGDGDGG")
                                let statusCode: number = await lastValueFrom(
                                    this.novaPoshtaService
                                        .getStatusDocuments(order.invoice)
                                        .pipe(
                                            map((res: NPResponseType<NPTrackingResponseType>) =>
                                                parseInt(res.data.length ? res.data[0].StatusCode : "")
                                            )
                                        )
                                );

                                if (statusCode == 9 || statusCode == 10 || statusCode == 11) {
                                    this.updateOrderStatus(order.id, OrderStatusEnum.Completed);

                                    return {
                                        ...order,
                                        status: OrderStatusEnum.Completed,
                                    };
                                } else if (statusCode == 102 || statusCode == 103) {
                                    this.updateOrderStatus(order.id, OrderStatusEnum.Cancelled);

                                    return {
                                        ...order,
                                        status: OrderStatusEnum.Cancelled,
                                    };
                                }
                            }

                            return order;
                        })
                    );

                    if (hasToUpdateResponse) {
                        this.ordersResponse.set(response);
                    }

                    return response;
                })
            );
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    public async getOrders(
        hasToUpdateResponse: boolean = true,
        options: OrderRequestType = this.ordersRequest()
    ): Promise<OrderResponseType> {
        return await firstValueFrom(
            new Observable<OrderResponseType>((subscriber: Subscriber<OrderResponseType>) => {
                const ordersSubscription: Subscription = this.orders$.subscribe(subscriber);
                this.requestSubject.next({ options, hasToUpdateResponse, url: "/order" });
                return ordersSubscription;
            })
        );
    }

    public async getUserOrders(
        hasToUpdateResponse: boolean = true,
        options: OrderRequestType = this.ordersRequest()
    ): Promise<OrderResponseType> {
        return await firstValueFrom(
            new Observable<OrderResponseType>((subscriber: Subscriber<OrderResponseType>) => {
                const ordersSubscription: Subscription = this.orders$.subscribe(subscriber);
                this.requestSubject.next({ options, hasToUpdateResponse, url: "/order/me" });
                return ordersSubscription;
            })
        );
    }

    public async createOrder(
        deliveryMethod: DeliveryMethodEnum,
        deliveryPrice: number,
        paymentMethod: PaymentMethodEnum,
        orderItems: { productId: string; amount: number }[],
        invoiceNumber: string | null,
        name?: string,
        surname?: string,
        phone?: string,
        email?: string
    ): Promise<void> {
        const body: { [key: string]: any } = {
            deliveryMethod,
            deliveryPrice,
            paymentMethod,
            orderItems,
        };

        if (name) {
            body["name"] = name;
        }

        if (surname) {
            body["surname"] = surname;
        }

        if (phone) {
            body["phone"] = phone;
        }

        if (email) {
            body["email"] = email;
        }

        if (invoiceNumber) {
            body["invoice"] = invoiceNumber;
        }

        await firstValueFrom<void>(this.httpClient.post<void>(environment.serverURL + "/order", body));

        if (name && surname && phone) {
            for (const item of orderItems) {
                this.cartService.removeFromCart("1", item.productId, false);
            }
        }
    }

    public async getUserOrdersAdmin(
        userId: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<OrderResponseType> {
        const body = {
            page,
            pageSize,
        };

        return await firstValueFrom<OrderResponseType>(
            this.httpClient.get<OrderResponseType>(environment.serverURL + `/order/user/${userId}`, { params: body })
        );
    }

    public async updateOrderStatus(orderId: string, status: string): Promise<void> {
        await firstValueFrom<void>(
            this.httpClient.put<void>(environment.serverURL + `/order/${orderId}/status`, { status })
        );
    }
}
