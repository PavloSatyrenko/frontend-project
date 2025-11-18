export type NPCounterpartySaveRequestType = {
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Phone: string;
    CounterpartyType: "PrivatePerson" | "Organization";
    CounterpartyProperty: "Recipient" | "Sender";
};

export interface NPCounterpartySaveOptions {
    firstName: string;
    middleName: string;
    lastName: string;
    phone: string;
}
