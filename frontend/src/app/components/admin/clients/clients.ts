import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, effect, inject, LOCALE_ID, OnInit, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Pagination } from "@shared/components/pagination/pagination";
import { Select } from "@shared/components/select/select";
import { Title } from "@shared/components/title/title";
import { ClientsService } from "@shared/services/clients.service";
import { MessageService } from "@shared/services/message.service";
import { OrdersService } from "@shared/services/orders.service";
import { ClientRequestType } from "@shared/types/ClientRequestType";
import { ClientResponseType } from "@shared/types/ClientResponseType";
import { ClientType } from "@shared/types/ClientType";
import { OrderRequestType } from "@shared/types/OrderRequestType";
import { OrderResponseType } from "@shared/types/OrderResponseType";
import { OrderStatusEnum } from "@shared/types/OrderStatusEnum";
import { OrderType } from "@shared/types/OrderType";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";

@Component({
    selector: "admin-clients",
    imports: [Input, Select, Button, CommonModule, Title, Pagination],
    providers: [{ provide: LOCALE_ID, useValue: "uk-UA" }],
    templateUrl: "./clients.html",
    styleUrl: "./clients.css",
})
export class Clients implements OnInit {
    protected clients: WritableSignal<ClientType[]> = signal<ClientType[]>([]);

    protected searchValue: WritableSignal<string> = signal("");
    protected selectedRole: WritableSignal<UserRoleEnum | "ALL"> = signal("ALL");

    protected state: WritableSignal<"loading" | "loaded" | "no-results"> = signal<"loading" | "loaded" | "no-results">("loading");

    protected selectedClient: WritableSignal<ClientType | null> = signal(null);

    protected clientOrdersQueryParams: WritableSignal<OrderRequestType> = signal<OrderRequestType>({
        page: 1,
        pageSize: 10,
    });
    protected clientOrdersResponse: WritableSignal<OrderResponseType> = signal<OrderResponseType>({
        orders: [],
        totalCount: 0,
        totalPages: 0,
        page: 1,
        pageSize: 10,
    });

    protected totalPages: WritableSignal<number> = signal<number>(0);

    protected readonly UserRoleEnum = UserRoleEnum;
    protected readonly OrderStatusEnum = OrderStatusEnum;

    protected readonly clientIdEditing: WritableSignal<string | null> = signal(null);

    protected nameValue: WritableSignal<string> = signal("");
    protected surnameValue: WritableSignal<string> = signal("");
    protected emailValue: WritableSignal<string> = signal("");
    protected phoneValue: WritableSignal<string> = signal("");
    protected discountValue: WritableSignal<number> = signal(0);
    protected roleValue: WritableSignal<UserRoleEnum> = signal(UserRoleEnum.Retail);

    private clientsService: ClientsService = inject(ClientsService);
    private ordersService: OrdersService = inject(OrdersService);
    private messageService: MessageService = inject(MessageService);

    constructor() {
        effect(() => {
            this.clientsService.clientsRequest.update((request: ClientRequestType) => {
                const selectedRole = this.selectedRole();

                if (selectedRole === "ALL") {
                    const { role, ...clientRequest } = request;
                    return clientRequest;
                }

                return {
                    ...request,
                    role: selectedRole,
                };
            });
        });
    }

    public ngOnInit(): void {
        this.filterClients();
    }

    protected filterClients(): void {
        this.clientsService.clientsRequest.update((request: ClientRequestType) => ({
            ...request,
            page: 1,
        }));

        setTimeout(() => {
            this.state.set("loading");
            this.loadClients();
        }, 0);
    }

    private async loadClients(): Promise<ClientResponseType> {
        return new Promise<ClientResponseType>((resolve, reject) => {
            this.clientsService.getClients()
                .then((response: ClientResponseType) => {
                    if ("message" in response) {
                        console.error(response.message);
                        this.messageService.showMessage(
                            "error",
                            "Помилка",
                            "Сталася помилка під час завантаження клієнтів. Спробуйте оновити сторінку."
                        );
                        reject(response.message);
                        return;
                    }

                    this.clients.set(response.clients);

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
                    this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
                    this.state.set("loaded");
                    reject(error);
                });
        });
    }

    protected onPageChange(page: number): void {
        this.clientsService.clientsRequest.update((request: ClientRequestType) => ({
            ...request,
            page: page,
        }));

        this.loadClients();
    }

    protected async onOrdersPageChange(page: number): Promise<void> {
        this.clientOrdersQueryParams.update((request: OrderRequestType) => ({
            ...request,
            page: page,
        }));

        try {
            await this.ordersService
                .getUserOrdersAdmin(this.selectedClient()!.id, this.clientOrdersQueryParams().page)
                .then((ordersRepsonse: OrderResponseType) => {
                    this.clientOrdersResponse.set(ordersRepsonse);
                });

            this.selectedClient.update((client: ClientType | null) => {
                if (client) {
                    return {
                        ...client,
                        orders: this.clientOrdersResponse().orders,
                    };
                }

                return client;
            });
        } catch (error) {
            console.error(error);

            if (error instanceof HttpErrorResponse) {
                this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
            }
        }
    }

    protected searchClick(): void {
        this.clientsService.clientsRequest.update((request: ClientRequestType) => {
            const searchValue: string = this.searchValue().trim();

            if (!searchValue) {
                const { search, ...clientRequest } = request;

                return clientRequest;
            }

            return {
                ...request,
                search: searchValue,
            };
        });

        this.filterClients();
    }

    protected clientEdit(clientId: string): void {
        const client = this.clients().find((client) => client.id === clientId);
        if (client !== undefined) {
            this.clientIdEditing.set(clientId);
            this.nameValue.set(client.name);
            this.surnameValue.set(client.surname);
            this.emailValue.set(client.email ? client.email : "");
            this.roleValue.set(client.role);
            this.discountValue.set(client.discount);

            setTimeout(() => {
                this.phoneValue.set(client.phone);
            }, 0);
        }
    }

    protected async clientSave(clientId: string): Promise<void> {
        const client = this.clients().find((c) => c.id === clientId);

        if (client) {
            const updatedClient: ClientType = { ...client };

            updatedClient.name = this.nameValue();
            updatedClient.surname = this.surnameValue();
            updatedClient.email = this.emailValue();
            updatedClient.phone = this.phoneValue();
            updatedClient.role = this.roleValue();
            updatedClient.discount = this.discountValue();

            if (updatedClient.email.trim() === "") {
                delete updatedClient.email;
            }

            try {
                await this.clientsService.updateClient(
                    updatedClient.id,
                    updatedClient.name,
                    updatedClient.surname,
                    updatedClient.phone,
                    updatedClient.role,
                    updatedClient.discount,
                    updatedClient.email
                );
                this.messageService.showMessage("success", "Успіх", "Клієнта успішно оновлено.");

                const newClients = this.clients().map((tempClient: ClientType) =>
                    tempClient.id === updatedClient.id ? { ...updatedClient } : tempClient
                );

                this.clients.set(newClients);
            } catch (error) {
                console.error(error);

                if (error instanceof HttpErrorResponse) {
                    this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
                }
            }
        }

        this.clientIdEditing.set(null);
    }

    protected clientCancel(): void {
        this.clientIdEditing.set(null);
    }

    protected async chooseClient(clientId: string): Promise<void> {
        if (this.clientIdEditing() == null) {
            this.selectedClient.set(this.clients().find((client: ClientType) => client.id == clientId)!);

            try {
                await this.ordersService.getUserOrdersAdmin(clientId).then((ordersRepsonse: OrderResponseType) => {
                    this.clientOrdersResponse.set(ordersRepsonse);
                });

                this.selectedClient.update((client: ClientType | null) => {
                    if (client) {
                        return {
                            ...client,
                            orders: this.clientOrdersResponse().orders,
                        };
                    }

                    return client;
                });
            } catch (error) {
                console.error(error);

                if (error instanceof HttpErrorResponse) {
                    this.messageService.showMessage("error", "Помилка", `Помилка: ${error.error.message ?? error.statusText}`);
                }
            }
        }
    }

    protected clearClientChoosing(): void {
        this.selectedClient.set(null);
    }
}
