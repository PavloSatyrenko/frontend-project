import { FilterValueType } from "./FilterValueType"

export type FilterType = {
    id: string,
    name: string,
    filterValues: FilterValueType[],
    // amountFound?: number
}