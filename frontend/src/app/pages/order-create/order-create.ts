import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatOption } from "@angular/material/autocomplete";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Link } from "@shared/components/link/link";
import { OrderProduct } from "@shared/components/order-product/order-product";
import { Radio } from "@shared/components/radio/radio";
import { Title } from "@shared/components/title/title";
import { AuthService } from "@shared/services/auth.service";
import { CartService } from "@shared/services/cart.service";
import { MessageService } from "@shared/services/message.service";
import { NovaPoshtaService } from "@shared/services/nova-poshta.service";
import { OrdersService } from "@shared/services/orders.service";
import { DeliveryMethodEnum } from "@shared/types/DeliveryMethodEnum";
import { NPCityAddressType } from "@shared/types/NPCityAddressType";
import { NPCityResponseType } from "@shared/types/NPCityResponseType";
import { NPPriceResponseType } from "@shared/types/NPPriceResponseType";
import { NPResponseType } from "@shared/types/NPResponseType";
import { NPServiceTypeEnum } from "@shared/types/NPServiceTypeEnum";
import { NPStreetAddressType } from "@shared/types/NPStreetAddressType";
import { NPStreetResponseType } from "@shared/types/NPStreetResponseType";
import { NPTimeIntervalsResponseType } from "@shared/types/NPTimeIntervalsResponseType";
import { NPWarehouseResponseType } from "@shared/types/NPWarehouseResponseType";
import { OrderProductType } from "@shared/types/OrderProductType";
import { PaymentMethodEnum } from "@shared/types/PaymentMethodEnum";
import { ShopingCartProductType } from "@shared/types/ShopingCartProductType";
import { UserType } from "@shared/types/UserType";
import {
    catchError,
    debounceTime,
    filter,
    firstValueFrom,
    from,
    map,
    mergeMap,
    Observable,
    of,
    retry,
    switchMap,
    tap,
    throwError,
} from "rxjs";
import { Select } from "@shared/components/select/select";
import { NPContactPersonResponseType } from "@shared/types/NPContactPersonResponseType";
import { NPCounterpartySaveResponseType } from "@shared/types/NPCounterpartySaveResponseType";
import { NPInvoiceBaseOptions, NPInvoiceSpecificOptions } from "@shared/types/NPInvoiceRequestType";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import { NPInvoiceResponseType } from "@shared/types/NPInvoiceResponseType";
import { ConfigService } from "@shared/services/config.service";
import { ConfigType } from "@shared/types/ConfigType";

@Component({
    selector: "page-order-create",
    imports: [
        Title,
        Button,
        Link,
        Input,
        OrderProduct,
        Radio,
        CommonModule,
        MatAutocompleteModule,
        MatOption,
        MatFormFieldModule,
        MatInputModule,
        MatLabel,
        ReactiveFormsModule,
        Select,
        Checkbox,
    ],
    templateUrl: "./order-create.html",
    styleUrl: "./order-create.css",
})
export class OrderCreate implements OnInit {
    protected readonly orderItems: WritableSignal<Omit<OrderProductType, "id">[]> = signal<
        Omit<OrderProductType, "id">[]
    >([]);

    protected readonly productsCount: Signal<number> = computed<number>(() => {
        return +this.orderItems()
            .reduce((total: number, product: Omit<OrderProductType, "id">) => {
                return total + product.amount;
            }, 0)
            .toFixed(2);
    });

    protected readonly productsPrice: Signal<number> = computed<number>(() => {
        return +this.orderItems()
            .reduce((total: number, product: Omit<OrderProductType, "id">) => {
                return (
                    total + product.amount * (product.priceOut ?? product.price * (1 - product.product.discount / 100))
                );
            }, 0)
            .toFixed(2);
    });

    protected readonly totalPrice: Signal<number> = computed<number>(() => {
        return +(this.productsPrice() + this.deliveryPrice()).toFixed(2);
    });
    protected readonly deliveryPrice: WritableSignal<number> = signal<number>(0);

    protected readonly deliveryDateString: Signal<string> = computed<string>(() => {
        const deliveryDelay: number = this.orderItems().reduce(
            (maxDeliveryDelay: number, item: Omit<OrderProductType, "id">) => {
                return maxDeliveryDelay < item.product.daysBeforeDelivery
                    ? item.product.daysBeforeDelivery
                    : maxDeliveryDelay;
            },
            0
        );

        const date: Date = new Date(new Date().getTime() + deliveryDelay);

        if (new Date().getHours() < 16) {
            return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        } else {
            const increasedDate: Date = new Date(date.getTime() + 24 * 60 * 60 * 1000);

            return `${increasedDate.getDate()}.${increasedDate.getMonth() + 1}.${increasedDate.getFullYear()}`;
        }
    });

    protected readonly selectedDeliveryMethod: WritableSignal<DeliveryMethodEnum> = signal<DeliveryMethodEnum>(
        DeliveryMethodEnum.Pickup
    );
    protected readonly DeliveryMethodEnum = DeliveryMethodEnum;

    protected readonly selectedPaymentMethod: WritableSignal<PaymentMethodEnum> = signal<PaymentMethodEnum>(
        PaymentMethodEnum.ManagerOnline
    );
    protected readonly PaymentMethodEnum = PaymentMethodEnum;

    protected readonly citiesFormControl: FormControl = new FormControl("");
    protected readonly streetsFormControl: FormControl = new FormControl({ value: "", disabled: true });
    protected readonly warehousesFormControl: FormControl = new FormControl({ value: "", disabled: true });

    protected NPCities$: Observable<NPCityResponseType> = of();
    protected NPStreets$: Observable<NPStreetResponseType> = of();
    protected NPWarehouses$: Observable<NPWarehouseResponseType[]> = of([]);
    protected NPParcelLockers$: Observable<NPWarehouseResponseType[]> = of([]);

    protected readonly selectedCity: WritableSignal<NPCityAddressType | null> = signal<NPCityAddressType | null>(null);
    protected readonly selectedStreet: WritableSignal<NPStreetAddressType | null> = signal<NPStreetAddressType | null>(
        null
    );
    protected readonly selectedWarehouse: WritableSignal<NPWarehouseResponseType | null> =
        signal<NPWarehouseResponseType | null>(null);
    protected readonly selectedParcelLocker: WritableSignal<NPWarehouseResponseType | null> =
        signal<NPWarehouseResponseType | null>(null);

    protected readonly recipientHouse: WritableSignal<string> = signal<string>("");
    protected readonly recipientFlat: WritableSignal<string> = signal<string>("");

    protected readonly isToDoors: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly recipientFloor: WritableSignal<number> = signal<number>(1);
    protected readonly hasElevator: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly timeIntervals: WritableSignal<NPTimeIntervalsResponseType[]> = signal<
        NPTimeIntervalsResponseType[]
    >([]);
    protected readonly selectedTimeInterval: WritableSignal<string> = signal<string>("");

    protected readonly recipientName: WritableSignal<string> = signal<string>("");
    protected readonly recipientMiddlename: WritableSignal<string> = signal<string>("");
    protected readonly recipientSurname: WritableSignal<string> = signal<string>("");
    protected readonly recipientPhone: WritableSignal<string> = signal<string>("");

    protected readonly isUserAuthorized: Signal<boolean> = computed(() => !!this.authService.user());

    protected readonly name: WritableSignal<string> = signal<string>("");
    protected readonly surname: WritableSignal<string> = signal<string>("");
    protected readonly phone: WritableSignal<string> = signal<string>("");
    protected readonly email: WritableSignal<string> = signal<string>("");

    private readonly configService: ConfigService = inject(ConfigService);
    private readonly cartService: CartService = inject(CartService);
    private readonly authService: AuthService = inject(AuthService);
    private readonly messageService: MessageService = inject(MessageService);
    private readonly ordersService: OrdersService = inject(OrdersService);
    private readonly novaPoshtaService: NovaPoshtaService = inject(NovaPoshtaService);
    private readonly router: Router = inject(Router);

    constructor() {
        this.NPCities$ = this.citiesFormControl.valueChanges.pipe(
            debounceTime(300),
            filter((value) => typeof value === "string"),
            switchMap((value) => {
                this.warehousesFormControl.setValue("");
                this.streetsFormControl.setValue("");

                if (!value || (this.selectedCity() && value !== this.selectedCity()!.Present)) {
                    this.selectedCity.set(null);
                    this.citiesFormControl.setValue("");

                    this.warehousesFormControl.disable();
                    this.streetsFormControl.disable();

                    this.selectedStreet.set(null);
                    this.selectedWarehouse.set(null);

                    this.timeIntervals.set([]);

                    return of();
                }

                return from(this.novaPoshtaService.getCities(value)).pipe(
                    mergeMap((res: NPResponseType<NPCityResponseType>) => {
                        if (!res.success || (res.errors && res.errors.length > 0)) {
                            const errMsg = (res.errors && res.errors.join("; ")) || "NovaPoshta returned error";
                            return throwError(() => new Error(errMsg));
                        }

                        return of(res.data[0]);
                    }),
                    retry({
                        count: 1,
                        delay: 1000,
                    }),
                    catchError(() => of())
                );
            })
        );

        this.NPStreets$ = this.streetsFormControl.valueChanges.pipe(
            debounceTime(300),
            filter((value) => typeof value === "string"),
            switchMap((value) => {
                if (
                    !value ||
                    !this.selectedCity() ||
                    (this.selectedStreet() && value !== this.selectedStreet()!.Present)
                ) {
                    this.selectedStreet.set(null);
                    this.streetsFormControl.setValue("");

                    return of();
                }

                return from(this.novaPoshtaService.getStreets(this.selectedCity()!.Ref, value)).pipe(
                    mergeMap((res: NPResponseType<NPStreetResponseType>) => {
                        if (!res.success || (res.errors && res.errors.length > 0)) {
                            const errMsg = (res.errors && res.errors.join("; ")) || "NovaPoshta returned error";
                            return throwError(() => new Error(errMsg));
                        }

                        return of(res.data[0]);
                    }),
                    retry({
                        count: 1,
                        delay: 1000,
                    }),
                    catchError(() => of())
                );
            })
        );

        this.NPWarehouses$ = this.warehousesFormControl.valueChanges.pipe(
            debounceTime(300),
            filter((value) => typeof value === "string"),
            switchMap((value) => {
                if (
                    !value ||
                    !this.selectedCity() ||
                    (this.selectedWarehouse() && value !== this.selectedWarehouse()!.Description)
                ) {
                    this.selectedWarehouse.set(null);
                    this.warehousesFormControl.setValue("");

                    return of();
                }

                const warehouseRef = "841339c7-591a-42e2-8233-7a0a00f0ed6f";
                const warehouseTinyRef = "6f8c7162-4b72-4b0a-88e5-906948c6a92f";
                const warehouseLargeRef = "9a68df70-0267-42a8-bb5c-37f427e36ee4";

                return this.novaPoshtaService.getWarehouses(this.selectedCity()!.DeliveryCity, value).pipe(
                    mergeMap((res: NPResponseType<NPWarehouseResponseType>) => {
                        if (!res.success || (res.errors && res.errors.length > 0)) {
                            const errMsg = (res.errors && res.errors.join("; ")) || "NovaPoshta returned error";
                            return throwError(() => new Error(errMsg));
                        }

                        return of(
                            res.data.filter((warehouse: NPWarehouseResponseType) => {
                                return (
                                    warehouse.TypeOfWarehouse === warehouseRef ||
                                    warehouse.TypeOfWarehouse === warehouseTinyRef ||
                                    warehouse.TypeOfWarehouse === warehouseLargeRef
                                );
                            })
                        );
                    }),
                    retry({
                        count: 1,
                        delay: 1000,
                    }),
                    catchError(() => of([]))
                );
            })
        );

        this.NPParcelLockers$ = this.warehousesFormControl.valueChanges.pipe(
            debounceTime(300),
            filter((value) => typeof value === "string"),
            switchMap((value) => {
                if (
                    !value ||
                    !this.selectedCity() ||
                    (this.selectedParcelLocker() && value !== this.selectedParcelLocker()!.Description)
                ) {
                    this.selectedParcelLocker.set(null);
                    this.warehousesFormControl.setValue("");

                    return of();
                }

                const parcelLockerRef = "f9316480-5f2d-425d-bc2c-ac7cd29decf0";
                const parcelLockerPrivatBankRef = "95dc212d-479c-4ffb-a8ab-8c1b9073d0bc";

                return this.novaPoshtaService.getWarehouses(this.selectedCity()!.DeliveryCity, value).pipe(
                    mergeMap((res: NPResponseType<NPWarehouseResponseType>) => {
                        if (!res.success || (res.errors && res.errors.length > 0)) {
                            const errMsg = (res.errors && res.errors.join("; ")) || "NovaPoshta returned error";
                            return throwError(() => new Error(errMsg));
                        }

                        return of(
                            res.data.filter((warehouse: NPWarehouseResponseType) => {
                                return (
                                    warehouse.TypeOfWarehouse === parcelLockerRef ||
                                    warehouse.TypeOfWarehouse === parcelLockerPrivatBankRef
                                );
                            })
                        );
                    }),
                    retry({
                        count: 1,
                        delay: 1000,
                    }),
                    catchError(() => of([]))
                );
            })
        );
    }

    ngOnInit(): void {
        this.loadSelectedShoppingCartProducts();

        if (this.isUserAuthorized()) {
            const user: UserType | null = this.authService.user();

            this.name.set(user?.name || "");
            this.surname.set(user?.surname || "");
            this.email.set(user?.email || "");
            this.phone.set(user?.phone || "");

            this.recipientName.set(user?.name || "");
            this.recipientSurname.set(user?.surname || "");
            this.recipientPhone.set(user?.phone || "");
        }
    }

    private loadSelectedShoppingCartProducts(): void {
        this.cartService.getShoppingCart(this.isUserAuthorized()).then((cartItems: ShopingCartProductType[]) => {
            this.orderItems.set(
                cartItems
                    .filter((cartItem: ShopingCartProductType) => cartItem.isChecked)
                    .map((cartItem: ShopingCartProductType) => ({
                        product: cartItem.product,
                        amount: cartItem.amount,
                        price: cartItem.product.price,
                    }))
            );

            if (!this.orderItems().length) {
                this.messageService.showMessage(
                    "error",
                    "Помилка",
                    "Ви не обрали жодного товару для оформлення замовлення"
                );

                this.router.navigate(["cabinet", "shopping-cart"]);
            }
        });
    }

    protected onDeliveryChange(method: DeliveryMethodEnum): void {
        this.selectedDeliveryMethod.set(method);

        if (
            method === DeliveryMethodEnum.Pickup &&
            (this.selectedPaymentMethod() === PaymentMethodEnum.CardOnDelivery ||
                this.selectedPaymentMethod() === PaymentMethodEnum.CashOnDelivery)
        ) {
            this.selectedPaymentMethod.set(PaymentMethodEnum.PaymentOnPickup);
        } else if (
            method !== DeliveryMethodEnum.Pickup &&
            this.selectedPaymentMethod() === PaymentMethodEnum.PaymentOnPickup
        ) {
            this.selectedPaymentMethod.set(PaymentMethodEnum.CashOnDelivery);
        }

        this.warehousesFormControl.setValue("");
        this.selectedWarehouse.set(null);
        this.selectedStreet.set(null);
        this.selectedTimeInterval.set("");
        this.recipientFlat.set("");
        this.recipientHouse.set("");
        this.deliveryPrice.set(0);
    }

    protected onPaymentChange(method: PaymentMethodEnum): void {
        this.selectedPaymentMethod.set(method);

        this.setDeliveryPrice();
    }

    protected onCitySelected(value: NPCityAddressType): void {
        this.selectedCity.set(value);
        this.warehousesFormControl.enable();
        this.streetsFormControl.enable();

        this.novaPoshtaService
            .getTimeIntervals(value.Ref, this.deliveryDateString())
            .pipe(
                tap((res: NPResponseType<NPTimeIntervalsResponseType>) => {
                    this.timeIntervals.set(res.data);
                    console.log(this.timeIntervals());
                })
            )
            .subscribe();
    }

    protected onEndpointSelected(
        type: "warehouse" | "parcelLocker" | "courier",
        value: NPWarehouseResponseType | NPStreetAddressType
    ): void {
        if (type == "warehouse") {
            this.selectedWarehouse.set(value as NPWarehouseResponseType);
        } else if (type == "parcelLocker") {
            this.selectedParcelLocker.set(value as NPWarehouseResponseType);
        } else if (type == "courier") {
            this.selectedStreet.set(value as NPStreetAddressType);
        }

        this.setDeliveryPrice();
    }

    private setDeliveryPrice(): void {
        const citySenderRef: string = this.configService.config().find((configItem: ConfigType) => {
            return configItem.key == "cityRef";
        })!.value;
        const weight: number = 0.1 * this.productsCount();

        let serviceType: NPServiceTypeEnum = NPServiceTypeEnum.WarehouseWarehouse;

        if (this.selectedDeliveryMethod() == DeliveryMethodEnum.ParcelLocker) {
            serviceType = NPServiceTypeEnum.WarehousePostomat;
        } else if (this.selectedDeliveryMethod() == DeliveryMethodEnum.Courier) {
            serviceType = NPServiceTypeEnum.WarehouseDoors;
        }

        const isBackward: boolean =
            this.selectedPaymentMethod() === PaymentMethodEnum.CashOnDelivery ||
            this.selectedPaymentMethod() === PaymentMethodEnum.CardOnDelivery;

        this.novaPoshtaService
            .getDeliveryPrice({
                citySenderRef,
                cityRecipientRef: this.selectedCity()!.DeliveryCity,
                weight,
                serviceType,
                cost: this.productsPrice(),
            })
            .pipe(
                tap((res: NPResponseType<NPPriceResponseType>) => {
                    console.log(res.data[0]);
                    if (isBackward) {
                        this.deliveryPrice.set(
                            Math.round(
                                (+parseFloat(res.data[0].Cost).toFixed(2) +
                                    20 +
                                    Math.floor(this.productsPrice() * 0.02)) *
                                    100
                            ) / 100
                        );
                    } else {
                        this.deliveryPrice.set(+parseFloat(res.data[0].Cost).toFixed(2));
                    }
                })
            )
            .subscribe();
    }

    protected async saveInvoice(): Promise<NPInvoiceResponseType | null> {
        const citySenderRef: string = this.configService.config().find((configItem: ConfigType) => {
            return configItem.key == "cityRef";
        })!.value;
        const senderCounterpartyRef: string = this.configService.config().find((configItem: ConfigType) => {
            return configItem.key == "counterpartyRef";
        })!.value;
        const senderContactPersonRef: string = this.configService.config().find((configItem: ConfigType) => {
            return configItem.key == "contactPersonRef";
        })!.value;
        const senderWarehouseRef: string = this.configService.config().find((configItem: ConfigType) => {
            return configItem.key == "warehouseRef";
        })!.value;
        const senderPhone: string = this.configService.config().find((configItem: ConfigType) => {
            return configItem.key == "senderPhone";
        })!.value;

        // const citySenderRef: string = "8d5a980d-391c-11dd-90d9-001a92567626";
        // const senderCounterpartyRef: string = "c7307294-b767-11f0-a1d5-48df37b921da";
        // const senderContactPersonRef: string = "c730cbaa-b767-11f0-a1d5-48df37b921da";
        // const senderWarehouseRef: string = "540b894c-8501-11e4-acce-0050568002cf";
        // const senderPhone: string = "380950101734";

        const weight: number = 0.1 * this.productsCount();
        const volumeGeneral: number = 0.01 * this.productsCount();

        let serviceType: NPServiceTypeEnum = NPServiceTypeEnum.WarehouseWarehouse;

        if (this.selectedDeliveryMethod() == DeliveryMethodEnum.ParcelLocker) {
            serviceType = NPServiceTypeEnum.WarehousePostomat;
        } else if (this.selectedDeliveryMethod() == DeliveryMethodEnum.Courier) {
            serviceType = NPServiceTypeEnum.WarehouseDoors;
        }

        const isBackward: boolean =
            this.selectedPaymentMethod() === PaymentMethodEnum.CashOnDelivery ||
            this.selectedPaymentMethod() === PaymentMethodEnum.CardOnDelivery;

        const invoicePaymentMethod: "Cash" | "NonCash" =
            this.selectedPaymentMethod() === PaymentMethodEnum.CardOnDelivery ? "NonCash" : "Cash";

        const recipientFullName: string = `${this.recipientSurname().trim()} ${this.recipientName().trim()} ${this.recipientMiddlename().trim()}`;

        try {
            const counterpartyRecipient = await firstValueFrom(this.novaPoshtaService.getCounterparties("Recipient"));

            if (!counterpartyRecipient.success || counterpartyRecipient.data.length === 0) {
                return null;
            }

            const counterpartyRecipientRef = counterpartyRecipient.data[0].Ref;

            const contactPerson = await firstValueFrom(
                this.novaPoshtaService.getContactPersons(counterpartyRecipientRef, this.recipientPhone())
            );

            if (!contactPerson.success) {
                return null;
            }

            let isContactPersonCreated: boolean = false;
            let contactPersonRef: string = "";

            contactPerson.data.forEach((person: NPContactPersonResponseType) => {
                if (!isContactPersonCreated && person.Description === recipientFullName) {
                    contactPersonRef = person.Ref;
                    isContactPersonCreated = true;
                }
            });

            if (!isContactPersonCreated) {
                contactPersonRef = await firstValueFrom(
                    this.novaPoshtaService
                        .saveCounterparty({
                            firstName: this.recipientName().trim(),
                            lastName: this.recipientSurname().trim(),
                            middleName: this.recipientMiddlename().trim(),
                            phone: this.recipientPhone(),
                        })
                        .pipe(
                            map((res: NPResponseType<NPCounterpartySaveResponseType>) => {
                                return res.data[0].ContactPerson.data[0].Ref;
                            })
                        )
                );
            }

            const paramsBase: NPInvoiceBaseOptions = {
                cost: this.productsPrice(),
                dateTimeString: this.deliveryDateString(),
                serviceType,
                weight,
                volumeGeneral,
                isBackward,
                citySenderRef,
                senderCounterpartyRef,
                senderContactPersonRef,
                senderWarehouseRef,
                senderPhone,
                cityRecipientRef: this.selectedCity()!.Ref,
                recipientsPhone: this.recipientPhone(),
                paymentMethod: invoicePaymentMethod,
            };

            const params: NPInvoiceSpecificOptions<NPServiceTypeEnum> | null = (() => {
                if (serviceType === NPServiceTypeEnum.WarehouseWarehouse) {
                    const resultParams: NPInvoiceSpecificOptions<NPServiceTypeEnum.WarehouseWarehouse> = {
                        ...paramsBase,
                        recipientCounterpartyRef: counterpartyRecipientRef,
                        recipientContactPersonRef: contactPersonRef,
                        recipientWarehouseRef: this.selectedWarehouse()!.Ref,
                    };

                    return resultParams as NPInvoiceSpecificOptions<NPServiceTypeEnum>;
                }

                if (serviceType === NPServiceTypeEnum.WarehousePostomat) {
                    const resultParams: NPInvoiceSpecificOptions<NPServiceTypeEnum.WarehousePostomat> = {
                        ...paramsBase,
                        recipientCounterpartyRef: counterpartyRecipientRef,
                        recipientContactPersonRef: contactPersonRef,
                        recipientPostomatRef: this.selectedParcelLocker()!.Ref,
                        volumetricHeight: 10 * this.productsCount(),
                        volumetricLength: 10,
                        volumetricWidth: 10,
                    };

                    return resultParams as NPInvoiceSpecificOptions<NPServiceTypeEnum>;
                }

                if (serviceType === NPServiceTypeEnum.WarehouseDoors) {
                    const resultParams: NPInvoiceSpecificOptions<NPServiceTypeEnum.WarehouseDoors> = {
                        ...paramsBase,
                        recipientAddressNameFromDict: this.selectedStreet()!.Present,
                        recipientName: recipientFullName,
                        recipientHouse: this.recipientHouse(),
                        recipientFlat: this.recipientFlat(),
                        isToDoors: this.isToDoors(),
                    };

                    if (this.isToDoors()) {
                        resultParams.floor = this.recipientFloor();
                        resultParams.hasElevator = this.hasElevator();
                    }

                    return resultParams as NPInvoiceSpecificOptions<NPServiceTypeEnum>;
                }

                return null;
            })();

            if (!params) {
                this.messageService.showMessage(
                    "error",
                    "Помилка створення накладної",
                    "Не вдалося створити накладну в Новій Пошті. Спробуйте пізніше."
                );
                return null;
            }

            const response = await firstValueFrom(this.novaPoshtaService.saveInvoice(params));

            const isSuccess = response.success && response.data.length > 0;

            return isSuccess ? response.data[0] : null;
        } catch (error) {
            console.error("Помилка при створенні накладної:", error);
            return null;
        }
    }

    protected displayCity(option: NPCityAddressType): string {
        return option ? option.Present : "";
    }

    protected displayStreet(option: NPStreetAddressType): string {
        return option ? option.Present : "";
    }

    protected displayWarehouse(option: NPWarehouseResponseType): string {
        return option ? option.Description : "";
    }

    protected async createOrder(): Promise<void> {
        const emailRegExp: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
        const houseRegex = /^[\d]{1,5}([А-ЯІЇЄҐ])?(([-\d]{1,3}|[\/][АЯІЇЄҐ\d]{1,4})|[А-ЯІЇЄҐ]{0,3})$/u;

        let invoice: NPInvoiceResponseType | null = null;

        if (this.selectedDeliveryMethod() !== DeliveryMethodEnum.Pickup) {
            if (!this.selectedCity()) {
                this.messageService.showMessage("error", "Помилка вводу", "Оберіть місто для доставки.");
                return;
            }

            if (!this.selectedStreet() && !this.selectedWarehouse() && !this.selectedParcelLocker()) {
                this.messageService.showMessage("error", "Помилка вводу", "Оберіть місце доставки.");
                return;
            }

            if (
                this.selectedDeliveryMethod() === DeliveryMethodEnum.Courier &&
                (this.recipientHouse().trim() == "" || !houseRegex.test(this.recipientHouse()))
            ) {
                this.messageService.showMessage("error", "Помилка вводу", "Номер будинку введенно некоректно.");
                return;
            }

            if (this.selectedDeliveryMethod() === DeliveryMethodEnum.Courier && this.recipientFlat().trim() == "") {
                this.messageService.showMessage("error", "Помилка вводу", "Номер квартири введенно некоректно.");
                return;
            }

            if (
                this.selectedDeliveryMethod() === DeliveryMethodEnum.Courier &&
                this.selectedTimeInterval().trim() == ""
            ) {
                this.messageService.showMessage("error", "Помилка вводу", "Оберіть бажаний інтервал доставки.");
                return;
            }

            if (
                this.selectedDeliveryMethod() === DeliveryMethodEnum.Courier &&
                this.isToDoors() &&
                !this.recipientFloor()
            ) {
                this.messageService.showMessage(
                    "error",
                    "Помилка вводу",
                    "Введіть номер поверху (1, якщо приватний будинок)."
                );
                return;
            }

            if (this.recipientName().trim() == "") {
                this.messageService.showMessage("error", "Помилка вводу", "Введіть ім'я отримувача.");
                return;
            }

            if (this.recipientSurname().trim() == "") {
                this.messageService.showMessage("error", "Помилка вводу", "Введіть прізвище отримувача.");
                return;
            }

            if (this.recipientMiddlename().trim() == "") {
                this.messageService.showMessage("error", "Помилка вводу", "Введіть по-батькові отримувача.");
                return;
            }

            if (this.recipientPhone() == "" || this.recipientPhone().length != 10) {
                this.messageService.showMessage("error", "Помилка вводу", "Телефон отримувача введенно некоректно.");
                return;
            }

            invoice = await this.saveInvoice();

            if (invoice == null) {
                this.messageService.showMessage(
                    "error",
                    "Помилка створення накладної",
                    "Не вдалося створити накладну в Новій Пошті. Спробуйте пізніше."
                );
                return;
            }
        }

        if (!this.isUserAuthorized()) {
            if (this.name().trim() == "") {
                this.messageService.showMessage("error", "Помилка вводу", "Ім'я введенно некоректно.");
                return;
            }

            if (this.surname().trim() == "") {
                this.messageService.showMessage("error", "Помилка вводу", "Прізвище введенно некоректно.");
                return;
            }

            if (this.email().trim() !== "" && !emailRegExp.test(this.email().trim())) {
                this.messageService.showMessage("error", "Помилка вводу", "Пошта введенна некоректно.");
                return;
            }

            if (this.phone() == "" || this.phone().length != 10) {
                this.messageService.showMessage("error", "Помилка вводу", "Телефон введенно некоректно.");
                return;
            }

            this.ordersService
                .createOrder(
                    this.selectedDeliveryMethod(),
                    invoice ? parseFloat(invoice!.CostOnSite) : 0,
                    this.selectedPaymentMethod(),
                    this.orderItems().map((orderItem: Omit<OrderProductType, "id">) => ({
                        productId: orderItem.product.id,
                        amount: orderItem.amount,
                    })),
                    invoice ? invoice.IntDocNumber : null,
                    this.name(),
                    this.surname(),
                    this.phone(),
                    this.email()
                )
                .then(() => {
                    this.messageService.showMessage("success", "Успіх", "Замовлення створено успішно.");
                    this.router.navigate([""]);
                });
        } else {
            this.ordersService
                .createOrder(
                    this.selectedDeliveryMethod(),
                    invoice ? parseFloat(invoice!.CostOnSite) : 0,
                    this.selectedPaymentMethod(),
                    this.orderItems().map((orderItem: Omit<OrderProductType, "id">) => ({
                        productId: orderItem.product.id,
                        amount: orderItem.amount,
                    })),
                    invoice ? invoice.IntDocNumber : null
                )
                .then(() => {
                    this.messageService.showMessage("success", "Успіх", "Замовлення створено успішно.");
                    this.router.navigate(["cabinet", "orders"]);
                });
        }
    }
}
