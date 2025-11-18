import { CommonModule } from "@angular/common";
import { Component, effect, inject, LOCALE_ID, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Pagination } from "@shared/components/pagination/pagination";
import { Select } from "@shared/components/select/select";
import { Title } from "@shared/components/title/title";
import { FormatProductNamePipe } from "@shared/pipes/format-product-name.pipe";
import { MessageService } from "@shared/services/message.service";
import { OrdersService } from "@shared/services/orders.service";
import { DeliveryMethodEnum } from "@shared/types/DeliveryMethodEnum";
import { OrderProductType } from "@shared/types/OrderProductType";
import { OrderRequestType } from "@shared/types/OrderRequestType";
import { OrderResponseType } from "@shared/types/OrderResponseType";
import { OrderStatusEnum } from "@shared/types/OrderStatusEnum";
import { OrderType } from "@shared/types/OrderType";

@Component({
    selector: "admin-orders",
    imports: [Input, Select, Button, CommonModule, FormatProductNamePipe, Title, Pagination],
    providers: [{ provide: LOCALE_ID, useValue: "uk-UA" }],
    templateUrl: "./orders.html",
    styleUrl: "./orders.css",
})
export class Orders implements OnInit {
    protected orders: WritableSignal<OrderType[]> = signal([]);

    protected searchValue: WritableSignal<string> = signal("");
    protected selectedStatus: WritableSignal<OrderStatusEnum | "ALL"> = signal("ALL");
    protected selectedPeriod: WritableSignal<"MONTH" | "HALF_YEAR" | "YEAR" | "ALL"> = signal("ALL");

    protected state: WritableSignal<"loading" | "loaded" | "no-results"> = signal<"loading" | "loaded" | "no-results">(
        "loading"
    );

    protected selectedOrder: WritableSignal<OrderType | null> = signal(null);

    protected orderStatus: WritableSignal<OrderStatusEnum> = signal(OrderStatusEnum.Accepted);

    protected totalPages: WritableSignal<number> = signal<number>(0);

    protected readonly OrderStatusEnum = OrderStatusEnum;
    protected readonly DeliveryMethodEnum = DeliveryMethodEnum;

    private ordersService: OrdersService = inject(OrdersService);
    private messageService: MessageService = inject(MessageService);

    constructor() {
        effect(() => {
            this.ordersService.ordersRequest.update((request: OrderRequestType) => {
                const selectedPeriod = this.selectedPeriod();

                if (selectedPeriod === "ALL") {
                    const { period, ...orderRequest } = request;
                    return orderRequest;
                }

                return {
                    ...request,
                    period: selectedPeriod,
                };
            });
        });

        effect(() => {
            this.ordersService.ordersRequest.update((request: OrderRequestType) => {
                const selectedStatus = this.selectedStatus();

                if (selectedStatus === "ALL") {
                    const { status, ...orderRequest } = request;
                    return orderRequest;
                }

                return {
                    ...request,
                    status: selectedStatus,
                };
            });
        });
    }

    public ngOnInit(): void {
        this.filterOrders();
    }

    protected filterOrders(): void {
        this.ordersService.ordersRequest.update((request: OrderRequestType) => ({
            ...request,
            page: 1,
        }));

        setTimeout(() => {
            this.state.set("loading");
            this.loadOrders();
        }, 0);
    }

    private async loadOrders(): Promise<OrderResponseType> {
        return new Promise<OrderResponseType>((resolve, reject) => {
            this.ordersService
                .getOrders()
                .then((response: OrderResponseType) => {
                    if ("message" in response) {
                        console.error(response.message);
                        this.messageService.showMessage(
                            "error",
                            "Помилка",
                            "Сталася помилка під час завантаження замовлень. Спробуйте оновити сторінку."
                        );
                        reject(response.message);
                        return;
                    }

                    this.orders.set(response.orders);

                    this.totalPages.set(response.totalPages);

                    if (response.totalCount === 0) {
                        this.state.set("no-results");
                    } else {
                        this.state.set("loaded");
                    }

                    resolve(response);
                })
                .catch((error) => {
                    console.error(error);
                    this.messageService.showMessage(
                        "error",
                        "Помилка",
                        `Помилка: ${error.error.message ?? error.statusText}`
                    );
                    this.state.set("loaded");
                    reject(error);
                });
        });
    }

    protected onPageChange(page: number): void {
        this.ordersService.ordersRequest.update((request: OrderRequestType) => ({
            ...request,
            page: page,
        }));

        this.loadOrders();
    }

    protected searchClick(): void {
        this.ordersService.ordersRequest.update((request: OrderRequestType) => {
            const searchValue: string = this.searchValue().trim();

            if (!searchValue) {
                const { search, ...orderRequest } = request;

                return orderRequest;
            }

            return {
                ...request,
                search: searchValue,
            };
        });

        this.filterOrders();
    }

    protected getProductTotalPrice(orderItem: OrderProductType): number {
        return orderItem.priceOut! * orderItem.amount;
    }

    protected chooseOrder(orderId: string) {
        this.selectedOrder.set(this.orders().find((order: OrderType) => order.id == orderId)!);
        this.orderStatus.set(this.selectedOrder()!.status);
    }

    protected clearOrderChoosing() {
        this.selectedOrder.set(null);
    }

    protected changeOrderStatus() {
        this.ordersService.updateOrderStatus(this.selectedOrder()!.id, this.orderStatus()).then(() => {
            this.orders.set(
                this.orders().map((order: OrderType) => {
                    if (this.selectedOrder()!.id !== order.id) {
                        return order;
                    }

                    return {
                        ...order,
                        status: this.orderStatus(),
                    };
                })
            );

            this.messageService.showMessage("success", "Успіх", "Статус замовлення успішно оновлено.");
        });
    }
}
