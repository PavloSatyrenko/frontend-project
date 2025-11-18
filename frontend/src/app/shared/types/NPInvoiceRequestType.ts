import { NPServiceTypeEnum } from "./NPServiceTypeEnum";

export type NPBaseInvoiceRequest = {
    Description: string;
    Cost: string;
    CargoType: "Parcel" | "Cargo";
    DateTime: string;
    PayerType: "Recipient" | "Sender" | "ThirdPerson";
    PaymentMethod: "Cash" | "NonCash";
    ServiceType: NPServiceTypeEnum;
    Weight: string;
    VolumeGeneral?: string;
    SeatsAmount: string;

    Sender: string;
    ContactSender: string;
    SendersPhone: string;
    CitySender: string;
    SenderAddress: string;

    RecipientType: "PrivatePerson" | "Organization";
    RecipientsPhone: string;
    CityRecipient: string;

    BackwardDeliveryData?: [
        {
            PayerType: "Recipient" | "Sender";
            CargoType: "Money";
            RedeliveryString: string;
        },
    ];
};

export type NPInvoiceRequestType<T extends NPServiceTypeEnum> = NPBaseInvoiceRequest &
    (T extends NPServiceTypeEnum.WarehouseWarehouse
        ? {
              Recipient: string;
              ContactRecipient: string;
              RecipientAddress: string;
          }
        : T extends NPServiceTypeEnum.WarehousePostomat
          ? {
                Recipient: string;
                ContactRecipient: string;
                RecipientAddress: string;
                OptionsSeat: [
                    {
                        volumetricVolume: string;
                        volumetricWidth: string;
                        volumetricLength: string;
                        volumetricHeight: string;
                        weight: string;
                    },
                ];
            }
          : {
                NewAddress: string;
                RecipientName: string;
                RecipientAddressName: string;
                RecipientHouse?: string;
                RecipientFlat?: string;
                Elevator?: "1" | "0";
                NumberOfFloorsLifting?: string;
                PreferredDeliveryDate?: string;
                TimeInterval?: string;
            });

export interface NPInvoiceBaseOptions {
    cost: number;
    dateTimeString: string;
    serviceType: NPServiceTypeEnum;
    weight: number;
    volumeGeneral: number;
    isBackward: boolean;

    citySenderRef: string;
    senderCounterpartyRef: string;
    senderContactPersonRef: string;
    senderWarehouseRef: string;
    senderPhone: string;

    cityRecipientRef: string;
    recipientsPhone: string;

    paymentMethod?: "Cash" | "NonCash";
    payerType?: "Recipient" | "Sender" | "ThirdPerson";
    cargoType?: string;
    seatsAmount?: number;
    recipientType?: "PrivatePerson" | "Organization";
}

export type NPInvoiceSpecificOptions<T extends NPServiceTypeEnum> = NPInvoiceBaseOptions &
    (T extends NPServiceTypeEnum.WarehouseWarehouse
        ? {
              recipientCounterpartyRef: string;
              recipientContactPersonRef: string;
              recipientWarehouseRef: string;
          }
        : T extends NPServiceTypeEnum.WarehousePostomat
          ? {
                recipientCounterpartyRef: string;
                recipientContactPersonRef: string;
                recipientPostomatRef: string;

                volumetricWidth: number;
                volumetricLength: number;
                volumetricHeight: number;
            }
          : {
                recipientAddressNameFromDict: string;
                recipientName: string;
                recipientHouse: string;
                recipientFlat: string;
                
                isToDoors: boolean;
                hasElevator?: boolean;
                floor?: number;
                preferredDeliveryDate?: string;
                timeInterval?: string;
            });
