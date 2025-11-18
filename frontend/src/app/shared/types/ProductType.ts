import { AvailabilityEnum } from "./AvailabilityEnum"

export type ProductType = {
    id: string,
    name: string,
    image: string[],
    manufacturer: string,
    code: string,
    price: number,
    availability: AvailabilityEnum,
    discount: number,
    amount: number,
    supplier: string,
    isActive: boolean,
    daysBeforeDelivery: number,
    categoryId: string,
    isFavorite: boolean,
    isRecommended: boolean,
}