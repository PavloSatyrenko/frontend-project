import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { NPCityResponseType } from "@shared/types/NPCityResponseType";
import { NPContactPersonResponseType } from "@shared/types/NPContactPersonResponseType";
import { NPCounterpartyGetResponseType } from "@shared/types/NPCounterpartyGetResponseType";
import { NPCounterpartySaveOptions } from "@shared/types/NPCounterpartySaveRequestType";
import { NPCounterpartySaveResponseType } from "@shared/types/NPCounterpartySaveResponseType";
import {
    NPInvoiceSpecificOptions,
    NPBaseInvoiceRequest,
    NPInvoiceRequestType,
} from "@shared/types/NPInvoiceRequestType";
import { NPInvoiceResponseType } from "@shared/types/NPInvoiceResponseType";
import { NPPriceOptions } from "@shared/types/NPPriceRequestType";
import { NPPriceResponseType } from "@shared/types/NPPriceResponseType";
import { NPRequestType } from "@shared/types/NPRequestType";
import { NPResponseType } from "@shared/types/NPResponseType";
import { NPServiceTypeEnum } from "@shared/types/NPServiceTypeEnum";
import { NPStreetResponseType } from "@shared/types/NPStreetResponseType";
import { NPTimeIntervalsResponseType } from "@shared/types/NPTimeIntervalsResponseType";
import { NPTrackingResponseType } from "@shared/types/NPTrackingResponseType";
import { NPWarehouseResponseType } from "@shared/types/NPWarehouseResponseType";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class NovaPoshtaService {
    private readonly httpClient = inject(HttpClient);

    public getCities(
        cityName: string,
        limit: number = 50,
        page: number = 1
    ): Observable<NPResponseType<NPCityResponseType>> {
        const body: NPRequestType<"AddressGeneral", "searchSettlements"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "AddressGeneral",
            calledMethod: "searchSettlements",
            methodProperties: {
                CityName: cityName,
                Limit: limit.toString(),
                Page: page.toString(),
            },
        };

        return this.httpClient.post<NPResponseType<NPCityResponseType>>(environment.NOVAPOST_URL, body);
    }

    public getStreets(
        cityRef: string,
        streetName: string,
        limit: number = 50,
        page: number = 1
    ): Observable<NPResponseType<NPStreetResponseType>> {
        const body: NPRequestType<"AddressGeneral", "searchSettlementStreets"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "AddressGeneral",
            calledMethod: "searchSettlementStreets",
            methodProperties: {
                SettlementRef: cityRef,
                StreetName: streetName,
                Limit: limit.toString(),
                Page: page.toString(),
            },
        };

        return this.httpClient.post<NPResponseType<NPStreetResponseType>>(environment.NOVAPOST_URL, body);
    }

    public getWarehouses(
        cityRef: string,
        searchValue: string,
        warehouseTypeRef?: string,
        limit: number = 50,
        page: number = 1
    ): Observable<NPResponseType<NPWarehouseResponseType>> {
        const body: NPRequestType<"Address", "getWarehouses"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "Address",
            calledMethod: "getWarehouses",
            methodProperties: {
                CityRef: cityRef,
                FindByString: searchValue,
                TypeOfWarehouseRef: warehouseTypeRef,
                Limit: limit.toString(),
                Page: page.toString(),
            },
        };

        return this.httpClient.post<NPResponseType<NPWarehouseResponseType>>(environment.NOVAPOST_URL, body);
    }

    public getDeliveryPrice(params: NPPriceOptions): Observable<NPResponseType<NPPriceResponseType>> {
        const body: NPRequestType<"InternetDocumentGeneral", "getDocumentPrice"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "InternetDocumentGeneral",
            calledMethod: "getDocumentPrice",
            methodProperties: {
                CitySender: params.citySenderRef,
                CityRecipient: params.cityRecipientRef,
                Weight: params.weight.toString(),
                ServiceType: params.serviceType,
                Cost: params.cost.toString(),
                CargoType: params.cargoType ? params.cargoType : "Cargo",
                SeatsAmount: params.seatsAmount ? params.seatsAmount.toString() : "1",
            },
        };

        return this.httpClient.post<NPResponseType<NPPriceResponseType>>(environment.NOVAPOST_URL, body);
    }

    public saveInvoice(
        params: NPInvoiceSpecificOptions<NPServiceTypeEnum>
    ): Observable<NPResponseType<NPInvoiceResponseType>> {
        const methodPropertiesBase: NPBaseInvoiceRequest = {
            Description: "Товар магазину автозапчастин",
            Cost: params.cost.toString(),
            CargoType: (params.cargoType as "Cargo" | "Parcel") ?? "Cargo",
            DateTime: params.dateTimeString,
            PayerType: params.payerType ?? "Recipient",
            ServiceType: params.serviceType,
            PaymentMethod: params.paymentMethod ?? "Cash",
            Weight: params.weight.toString(),
            VolumeGeneral: params.volumeGeneral.toString(),
            SeatsAmount: params.seatsAmount ? params.seatsAmount.toString() : "1",
            Sender: params.senderCounterpartyRef,
            ContactSender: params.senderContactPersonRef,
            SendersPhone: params.senderPhone,
            CitySender: params.citySenderRef,
            SenderAddress: params.senderWarehouseRef,
            RecipientType: params.recipientType ?? "PrivatePerson",
            RecipientsPhone: params.recipientsPhone,
            CityRecipient: params.cityRecipientRef,
        };

        const methodProperties: NPInvoiceRequestType<NPServiceTypeEnum> = (() => {
            let tempParams: NPInvoiceSpecificOptions<NPServiceTypeEnum>;

            if (params.serviceType === NPServiceTypeEnum.WarehouseWarehouse) {
                tempParams = params as NPInvoiceSpecificOptions<NPServiceTypeEnum.WarehouseWarehouse>;

                const resultProperties: NPInvoiceRequestType<NPServiceTypeEnum.WarehouseWarehouse> = {
                    ...methodPropertiesBase,
                    Recipient: tempParams.recipientCounterpartyRef,
                    ContactRecipient: tempParams.recipientContactPersonRef,
                    RecipientAddress: tempParams.recipientWarehouseRef,
                };

                return resultProperties as unknown as NPInvoiceRequestType<NPServiceTypeEnum>;
            }

            if (params.serviceType === NPServiceTypeEnum.WarehousePostomat) {
                tempParams = params as NPInvoiceSpecificOptions<NPServiceTypeEnum.WarehousePostomat>;

                const resultProperties: NPInvoiceRequestType<NPServiceTypeEnum.WarehousePostomat> = {
                    ...methodPropertiesBase,
                    Recipient: tempParams.recipientCounterpartyRef,
                    ContactRecipient: tempParams.recipientContactPersonRef,
                    RecipientAddress: tempParams.recipientPostomatRef,
                    OptionsSeat: [
                        {
                            volumetricVolume: tempParams.volumeGeneral.toString(),
                            volumetricWidth: tempParams.volumetricWidth.toString(),
                            volumetricLength: tempParams.volumetricLength.toString(),
                            volumetricHeight: tempParams.volumetricHeight.toString(),
                            weight: tempParams.weight.toString(),
                        },
                    ],
                };

                return resultProperties as unknown as NPInvoiceRequestType<NPServiceTypeEnum>;
            }

            if (params.serviceType === NPServiceTypeEnum.WarehouseDoors) {
                tempParams = params as NPInvoiceSpecificOptions<NPServiceTypeEnum.WarehouseDoors>;

                const resultProperties: NPInvoiceRequestType<NPServiceTypeEnum.WarehouseDoors> = {
                    ...methodPropertiesBase,
                    ServiceType: tempParams.serviceType,
                    NewAddress: "1",
                    RecipientName: tempParams.recipientName,
                    RecipientAddressName: tempParams.recipientAddressNameFromDict,
                    RecipientHouse: tempParams.recipientHouse,
                    RecipientFlat: tempParams.recipientFlat,
                    PreferredDeliveryDate: tempParams.preferredDeliveryDate,
                    TimeInterval: tempParams.timeInterval,
                };

                if (tempParams.isToDoors) {
                    resultProperties.Elevator = tempParams.hasElevator ? "1" : "0";
                    resultProperties.NumberOfFloorsLifting = tempParams.floor!.toString();
                }

                return resultProperties as unknown as NPInvoiceRequestType<NPServiceTypeEnum>;
            }

            throw new Error("Unsupported service type");
        })();

        const body: NPRequestType<"InternetDocumentGeneral", "save"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "InternetDocumentGeneral",
            calledMethod: "save",
            methodProperties: methodProperties,
        };

        if (params.isBackward) {
            body.methodProperties.BackwardDeliveryData = [
                {
                    PayerType: "Recipient",
                    CargoType: "Money",
                    RedeliveryString: params.cost.toString(),
                },
            ];
        }

        return this.httpClient.post<NPResponseType<NPInvoiceResponseType>>(environment.NOVAPOST_URL, body);
    }

    public getTimeIntervals(
        cityRef: string,
        dateTimeString: string
    ): Observable<NPResponseType<NPTimeIntervalsResponseType>> {
        const body: NPRequestType<"Common", "getTimeIntervals"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "Common",
            calledMethod: "getTimeIntervals",
            methodProperties: {
                RecipientCityRef: cityRef,
                DateTime: dateTimeString,
            },
        };

        return this.httpClient.post<NPResponseType<NPTimeIntervalsResponseType>>(environment.NOVAPOST_URL, body);
    }

    public saveCounterparty(
        params: NPCounterpartySaveOptions
    ): Observable<NPResponseType<NPCounterpartySaveResponseType>> {
        const body: NPRequestType<"Counterparty", "save"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "Counterparty",
            calledMethod: "save",
            methodProperties: {
                CounterpartyProperty: "Recipient",
                CounterpartyType: "PrivatePerson",
                FirstName: params.firstName,
                MiddleName: params.middleName,
                LastName: params.lastName,
                Phone: params.phone,
            },
        };

        return this.httpClient.post<NPResponseType<NPCounterpartySaveResponseType>>(environment.NOVAPOST_URL, body);
    }

    public getCounterparties(
        property: "Recipient" | "Sender"
    ): Observable<NPResponseType<NPCounterpartyGetResponseType>> {
        const body: NPRequestType<"Counterparty", "getCounterparties"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "Counterparty",
            calledMethod: "getCounterparties",
            methodProperties: {
                CounterpartyProperty: property,
            },
        };

        return this.httpClient.post<NPResponseType<NPCounterpartyGetResponseType>>(environment.NOVAPOST_URL, body);
    }

    public getContactPersons(
        counterpartyRef: string,
        searchValue: string
    ): Observable<NPResponseType<NPContactPersonResponseType>> {
        const body: NPRequestType<"Counterparty", "getCounterpartyContactPersons"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "Counterparty",
            calledMethod: "getCounterpartyContactPersons",
            methodProperties: {
                Ref: counterpartyRef,
                FindByString: searchValue,
            },
        };

        return this.httpClient.post<NPResponseType<NPContactPersonResponseType>>(environment.NOVAPOST_URL, body);
    }

    public getStatusDocuments(
        invoiceNumber: string,
        phone?: string
    ): Observable<NPResponseType<NPTrackingResponseType>> {
        const body: NPRequestType<"TrackingDocumentGeneral", "getStatusDocuments"> = {
            apiKey: environment.NOVAPOST_KEY,
            modelName: "TrackingDocumentGeneral",
            calledMethod: "getStatusDocuments",
            methodProperties: {
                Documents: [
                    {
                        DocumentNumber: invoiceNumber,
                    },
                ],
            },
        };

        if (phone) {
            body.methodProperties.Documents[0].Phone = phone;
        }

        return this.httpClient.post<NPResponseType<NPTrackingResponseType>>(environment.NOVAPOST_URL, body);
    }
}
