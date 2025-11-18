import { NPStreetAddressType } from "./NPStreetAddressType";

export type NPStreetResponseType = {
    TotalCount: number;
    Addresses: NPStreetAddressType[];
}