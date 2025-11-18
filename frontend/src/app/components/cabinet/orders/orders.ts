import { Component, effect, inject, signal, WritableSignal } from "@angular/core";
import { Input } from "@shared/components/input/input";
import { Select } from "@shared/components/select/select";
import { Title } from "@shared/components/title/title";
import { OrderCard } from "./order-card/order-card";
import { OrderType } from "@shared/types/OrderType";
import { OrdersService } from "@shared/services/orders.service";
import { MessageService } from "@shared/services/message.service";
import { OrderRequestType } from "@shared/types/OrderRequestType";
import { OrderResponseType } from "@shared/types/OrderResponseType";
import { Button } from "@shared/components/button/button";

@Component({
    selector: "cabinet-orders",
    imports: [Title, Input, Select, OrderCard, Button],
    templateUrl: "./orders.html",
    styleUrl: "./orders.css"
})
export class Orders {
    protected readonly orders: WritableSignal<OrderType[]> = signal<OrderType[]>([]);

    protected readonly searchValue: WritableSignal<string> = signal<string>("");
    protected selectedPeriod: WritableSignal<"MONTH" | "HALF_YEAR" | "YEAR" | "ALL"> = signal("ALL");

    protected isShowMoreButtonVisible: WritableSignal<boolean> = signal<boolean>(true);

    protected state: WritableSignal<"loading" | "loading-more" | "loaded" | "no-results"> = signal<"loading" | "loading-more" | "loaded" | "no-results">("loading");

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
                    period: selectedPeriod
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
            page: 1
        }));

        setTimeout(() => {
            this.state.set("loading");
            this.loadOrders(false);
        }, 0);
    }

    private async loadOrders(doShowPrevious: boolean): Promise<OrderResponseType> {
        return new Promise<OrderResponseType>((resolve, reject) => {
            this.ordersService.getUserOrders()
                .then((response: OrderResponseType) => {
                    if ("message" in response) {
                        console.error(response.message);
                        this.messageService.showMessage("error", "Помилка", "Сталася помилка під час завантаження замовлень. Спробуйте оновити сторінку.");
                        reject(response.message);
                        return;
                    }

                    if (doShowPrevious) {
                        this.orders.update((orders: OrderType[]) => [...orders, ...response.orders]);
                    }
                    else {
                        this.orders.set(response.orders);
                    }

                    this.isShowMoreButtonVisible.set(response.page < response.totalPages);

                    if (response.totalCount === 0) {
                        this.state.set("no-results");
                    }
                    else {
                        this.state.set("loaded");
                    }

                    resolve(response);
                })
                .catch((error) => {
                    console.error(error);
                    this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
                    this.state.set("loaded");
                    reject(error);
                });
        });
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
                search: searchValue
            };
        });

        this.filterOrders();
    }

    protected showMore(): void {
        const ordersRequest: OrderRequestType = this.ordersService.ordersRequest();

        if ("message" in ordersRequest) {
            return;
        }

        this.ordersService.ordersRequest.update((request: OrderRequestType) => ({
            ...request,
            page: (request.page || 0) + 1
        }));

        this.state.set("loading-more");
        this.loadOrders(true);
    }
}
