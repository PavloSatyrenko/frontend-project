import { NPContactPersonResponseType } from "./NPContactPersonResponseType";
import { NPResponseType } from "./NPResponseType";

export type NPCounterpartySaveResponseType = {
    Ref: string;
    Description: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Counterparty: string;
    OwnershipForm: string;
    OwnershipFormDescription: string;
    EDRPOU: string;
    CounterpartyType: string;
    ContactPerson: NPResponseType<NPContactPersonResponseType>;
};
