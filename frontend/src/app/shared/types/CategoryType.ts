export type CategoryType = {
    id: string,
    name: string,
    subcategories: CategoryType[] | null
}