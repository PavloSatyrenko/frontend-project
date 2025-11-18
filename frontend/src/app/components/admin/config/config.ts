import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { ConfigService } from "@shared/services/config.service";
import { ConfigType } from "@shared/types/ConfigType";
import { Input } from "@shared/components/input/input";
import { Button } from "@shared/components/button/button";
import { UserRoleEnum } from "@shared/types/UserRoleEnum";
import {
    catchError,
    debounceTime,
    filter,
    firstValueFrom,
    from,
    mergeMap,
    Observable,
    of,
    retry,
    switchMap,
    tap,
    throwError,
} from "rxjs";
import { NPCityResponseType } from "@shared/types/NPCityResponseType";
import { NPWarehouseResponseType } from "@shared/types/NPWarehouseResponseType";
import { NPCounterpartyGetResponseType } from "@shared/types/NPCounterpartyGetResponseType";
import { NPContactPersonResponseType } from "@shared/types/NPContactPersonResponseType";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatOption } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { NPCityAddressType } from "@shared/types/NPCityAddressType";
import { NPResponseType } from "@shared/types/NPResponseType";
import { NovaPoshtaService } from "@shared/services/nova-poshta.service";
import { CommonModule } from "@angular/common";
import { Select } from "@shared/components/select/select";
import { MessageService } from "@shared/services/message.service";

@Component({
    selector: "app-config",
    imports: [
        Title,
        Input,
        Button,
        MatAutocompleteModule,
        MatOption,
        MatFormFieldModule,
        MatInputModule,
        MatLabel,
        ReactiveFormsModule,
        CommonModule,
        Select,
    ],
    templateUrl: "./config.html",
    styleUrl: "./config.css",
})
export class Config implements OnInit {
    protected readonly configRoleDiscount: Signal<ConfigType[]> = computed<ConfigType[]>(() => {
        return this.configService.config().filter((config: ConfigType) => config.group === "roleDiscount");
    });
    protected readonly configContacts: Signal<ConfigType[]> = computed<ConfigType[]>(() => {
        return this.configService
            .config()
            .filter((config: ConfigType) => config.group === "contact")
            .sort((a, b) => {
                const order = ["firstPhone", "secondPhone", "email"];
                return order.indexOf(a.key) - order.indexOf(b.key);
            });
    });
    protected readonly configNova: Signal<ConfigType[]> = computed<ConfigType[]>(() => {
        return this.configService
            .config()
            .filter((config: ConfigType) => config.group === "nova")
            .sort((a, b) => {
                const order = ["cityName", "warehouseName", "contactPersonFullName", "senderPhone"];
                return order.indexOf(a.key) - order.indexOf(b.key);
            });
    });

    protected readonly citiesFormControl: FormControl = new FormControl("");
    protected readonly warehousesFormControl: FormControl = new FormControl({ value: "", disabled: true });

    protected NPCities$: Observable<NPCityResponseType> = of();
    protected NPWarehouses$: Observable<NPWarehouseResponseType[]> = of([]);

    protected NPContactPersons: WritableSignal<NPContactPersonResponseType[]> = signal<NPContactPersonResponseType[]>(
        []
    );

    protected readonly selectedCity: WritableSignal<NPCityAddressType | null> = signal<NPCityAddressType | null>(null);
    protected readonly selectedWarehouse: WritableSignal<NPWarehouseResponseType | null> =
        signal<NPWarehouseResponseType | null>(null);

    protected readonly senderPhone: WritableSignal<string> = signal<string>("");
    protected readonly senderCounterpartyRef: WritableSignal<string> = signal<string>("");
    protected readonly senderContactPersonRef: WritableSignal<string> = signal<string>("");
    protected readonly senderContactPersonName: WritableSignal<string> = signal<string>("");

    protected readonly configIdEditing: WritableSignal<string | null> = signal<string | null>(null);
    protected readonly configTypeEditing: WritableSignal<"roleDiscount" | "contact" | "nova" | ""> = signal<
        "roleDiscount" | "contact" | "nova" | ""
    >("");
    protected readonly roleDiscountValue: WritableSignal<number> = signal<number>(0);
    protected readonly contactValue: WritableSignal<string> = signal<string>("");
    protected readonly novaValue: WritableSignal<string> = signal<string>("");

    protected readonly isEditConfirmationVisible: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly UserRoleEnum = UserRoleEnum;

    private configService: ConfigService = inject(ConfigService);
    private novaPoshtaService: NovaPoshtaService = inject(NovaPoshtaService);
    private messageService: MessageService = inject(MessageService);

    constructor() {
        this.NPCities$ = this.citiesFormControl.valueChanges.pipe(
            debounceTime(300),
            filter((value) => typeof value === "string"),
            switchMap((value) => {
                this.warehousesFormControl.setValue("");

                if (!value || (this.selectedCity() && value !== this.selectedCity()!.Present)) {
                    this.selectedCity.set(null);
                    this.citiesFormControl.setValue("");

                    this.warehousesFormControl.disable();

                    this.selectedWarehouse.set(null);

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
    }

    ngOnInit(): void {
        this.loadCounterparty();
    }

    private loadCounterparty(): void {
        this.novaPoshtaService
            .getCounterparties("Sender")
            .pipe(
                tap((response: NPResponseType<NPCounterpartyGetResponseType>) => {
                    const configCounterparty = this.configService
                        .config()
                        .find((conItem: ConfigType) => conItem.key == "counterpartyRef");

                    if (configCounterparty) {
                        this.senderCounterpartyRef.set(configCounterparty.value ?? response.data[0].Ref);
                    }

                    this.senderCounterpartyRef.set(response.data.length ? response.data[0].Ref : "");

                    this.loadContactPersons(this.senderCounterpartyRef());
                })
            )
            .subscribe();
    }

    private loadContactPersons(contactPersonRef: string): void {
        this.novaPoshtaService
            .getContactPersons(contactPersonRef, "")
            .pipe(
                tap((response: NPResponseType<NPContactPersonResponseType>) => {
                    this.NPContactPersons.set(response.data);

                    const configContactPersonRef: ConfigType | null =
                        this.configService.config().find((conItem: ConfigType) => conItem.key == "contactPersonRef") ??
                        null;

                    if (configContactPersonRef) {
                        this.senderContactPersonRef.set(configContactPersonRef.value ?? response.data[0].Ref);
                    }

                    const configContactPersonName: ConfigType | null =
                        this.configService
                            .config()
                            .find((conItem: ConfigType) => conItem.key == "contactPersonFullName") ?? null;

                    if (configContactPersonName) {
                        this.senderContactPersonName.set(configContactPersonName.value ?? response.data[0].Ref);
                    }

                    this.senderContactPersonRef.set(response.data.length ? response.data[0].Ref : "");
                    this.senderContactPersonName.set(
                        response.data.length
                            ? `${response.data[0].LastName} ${response.data[0].FirstName} ${response.data[0].MiddleName}`
                            : ""
                    );
                })
            )
            .subscribe();
    }

    protected editConfig(configId: string, type: "roleDiscount" | "contact" | "nova"): void {
        this.configIdEditing.set(configId);
        this.configTypeEditing.set(type);

        if (type === "roleDiscount") {
            this.roleDiscountValue.set(+this.configRoleDiscount().find((config: ConfigType) => config.id === configId)!.value);
        } else if (type === "contact") {
            this.contactValue.set(this.configContacts().find((config: ConfigType) => config.id === configId)!.value);
        }
    }

    protected cancelConfigEditing(): void {
        this.configIdEditing.set(null);
        this.configTypeEditing.set("");

        this.closeEditConfirmationPopup();
    }

    protected openEditConfirmation(): void {
        this.isEditConfirmationVisible.set(true);
    }

    protected saveConfig(type: "roleDiscount" | "contact" | "nova" | ""): void {
        this.closeEditConfirmationPopup();

        let editedConfig: ConfigType;
        let value: string = "";
        if (type === "roleDiscount") {
            editedConfig = this.configRoleDiscount().find((config: ConfigType) => config.id === this.configIdEditing())!;
            value = this.roleDiscountValue().toString();
        } else if (type === "contact") {
            editedConfig = this.configContacts().find((config: ConfigType) => config.id === this.configIdEditing())!;
            value = this.contactValue();
        } else if (type === "nova") {
            this.saveNovaConfig();
        }

        const key: string = editedConfig!.key;

        this.updateConfig(key, value, type);

        this.configIdEditing.set(null);
    }

    protected closeEditConfirmationPopup() {
        this.isEditConfirmationVisible.set(false);
    }

    protected displayWarehouse(option: NPWarehouseResponseType): string {
        return option ? option.Description : "";
    }

    protected displayCity(option: NPCityAddressType): string {
        return option ? option.Present : "";
    }

    protected onWarehouesSelected(value: NPWarehouseResponseType): void {
        this.selectedWarehouse.set(value);
    }

    protected onCitySelected(value: NPCityAddressType): void {
        this.selectedCity.set(value);
        this.warehousesFormControl.enable();
    }

    private saveNovaConfig(): void {
        if (!this.selectedCity()) {
            this.messageService.showMessage("error", "Помилка вводу", "Оберіть місто відправника.");
            return;
        }

        if (!this.selectedWarehouse()) {
            this.messageService.showMessage("error", "Помилка вводу", "Оберіть відділення відправника.");
            return;
        }

        if (this.senderPhone() == "" || this.senderPhone().length != 10) {
            this.messageService.showMessage("error", "Помилка вводу", "Телефон відправника введенно некоректно.");
            return;
        }

        if (!this.senderContactPersonRef()) {
            this.messageService.showMessage("error", "Помилка вводу", "Оберіть контактну особу відправника.");
            return;
        }

        this.configService.setConfigValue("senderPhone", this.senderPhone(), "nova");
        this.configService.setConfigValue("counterpartyRef", this.senderCounterpartyRef(), "nova");
        this.configService.setConfigValue("contactPersonRef", this.senderContactPersonRef(), "nova");
        this.configService.setConfigValue("contactPersonFullName", this.senderContactPersonName(), "nova");
        this.configService.setConfigValue("cityRef", this.selectedCity()!.DeliveryCity, "nova");
        this.configService.setConfigValue("cityName", this.selectedCity()!.Present, "nova");
        this.configService.setConfigValue("warehouseRef", this.selectedWarehouse()!.Ref, "nova");
        this.configService.setConfigValue("warehouseName", this.selectedWarehouse()!.Description, "nova");

        this.messageService.showMessage("success", "Успіх", "Конфіг успішно оновлено.");
        this.configTypeEditing.set("");
    }

    protected addDefaultConfig(): void {
        this.configService.setConfigValue(UserRoleEnum.Retail, "0", "roleDiscount");
        this.configService.setConfigValue(UserRoleEnum.Wholesale, "15", "roleDiscount");
        this.configService.setConfigValue(UserRoleEnum.ServiceStation, "20", "roleDiscount");

        this.configService.setConfigValue("firstPhone", "", "contact");
        this.configService.setConfigValue("secondPhone", "", "contact");
        this.configService.setConfigValue("email", "", "contact");

        this.configService.setConfigValue("senderPhone", "", "nova");
        this.configService.setConfigValue("counterpartyRef", "", "nova");
        this.configService.setConfigValue("contactPersonRef", "", "nova");
        this.configService.setConfigValue("contactPersonFullName", "", "nova");
        this.configService.setConfigValue("cityRef", "", "nova");
        this.configService.setConfigValue("cityName", "", "nova");
        this.configService.setConfigValue("warehouseRef", "", "nova");
        this.configService.setConfigValue("warehouseName", "", "nova");
    }

    private updateConfig(key: string, value: string, group: string): void {
        this.configService.setConfigValue(key, value, group);
    }
}
