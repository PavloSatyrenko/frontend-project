import { NPCityRequestType } from "./NPCityRequestType";
import { NPContactPersonRequestType } from "./NPContactPersonRequestType";
import { NPCounterpartyGetRequestType } from "./NPCounterpartyGetRequestType";
import { NPCounterpartySaveRequestType } from "./NPCounterpartySaveRequestType";
import { NPInvoiceRequestType } from "./NPInvoiceRequestType";
import { NPPriceRequestType } from "./NPPriceRequestType";
import { NPServiceTypeEnum } from "./NPServiceTypeEnum";
import { NPStreetRequestType } from "./NPStreetRequestType";
import { NPTimeIntervalsRequestType } from "./NPTimeIntervalsRequestType";
import { NPTrackingRequestType } from "./NPTrackingRequestType";
import { NPWarehouseRequestType } from "./NPWarehouseRequestType";

export interface NPModels {
    AddressGeneral: {
        searchSettlements: NPCityRequestType;
        searchSettlementStreets: NPStreetRequestType;
    };
    Address: {
        getWarehouses: NPWarehouseRequestType;
    };
    Common: {
        getTimeIntervals: NPTimeIntervalsRequestType;
    };
    InternetDocumentGeneral: {
        getDocumentPrice: NPPriceRequestType;
        save: NPInvoiceRequestType<NPServiceTypeEnum>;
    };
    Counterparty: {
        save: NPCounterpartySaveRequestType;
        getCounterparties: NPCounterpartyGetRequestType;
        getCounterpartyContactPersons: NPContactPersonRequestType;
    };
    TrackingDocumentGeneral: {
        getStatusDocuments: NPTrackingRequestType;
    };
}
