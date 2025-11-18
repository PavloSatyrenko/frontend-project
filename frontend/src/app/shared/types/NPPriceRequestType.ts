import { NPServiceTypeEnum } from "./NPServiceTypeEnum";

export type NPPriceRequestType = {
    CitySender: string;
    CityRecipient: string;
    Weight: string;
    ServiceType: NPServiceTypeEnum;
    Cost: string;
    CargoType: string;
    SeatsAmount: string;
};

export interface NPPriceOptions {
    citySenderRef: string;
    cityRecipientRef: string;
    weight: number;
    serviceType: NPServiceTypeEnum;
    cost: number;
    cargoType?: string;
    seatsAmount?: number;
}
