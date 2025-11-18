import { param, query, body } from "express-validator";

export const productValidator = {
    getProductsValidator: [
        query("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("pageSize")
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage("Page size must be a positive integer between 1 and 100"),
        query("categoryId")
            .optional()
            .isUUID().withMessage("Category ID must be a valid UUID"),
        query("subcategoryIds")
            .optional()
            .customSanitizer((value: string | string[]): string[] => {
                if (typeof value === "string") {
                    return [value];
                }
                return value;
            })
            .isArray().withMessage("Subcategories must be an array"),
        query("subcategoryIds.*")
            .notEmpty().withMessage("Each subcategory is required")
            .isUUID().withMessage("Each subcategory must be a valid UUID"),
        query("minPrice")
            .optional()
            .isInt({ min: 0 }).withMessage("Minimum price must be a positive integer")
            .toFloat(),
        query("maxPrice")
            .optional()
            .isInt({ min: 0 }).withMessage("Maximum price must be a positive integer")
            .toFloat()
            .custom((value, { req }) => {
                const minPrice = req.query?.minPrice ? parseFloat(req.query.minPrice as string) : null;
                if (value && minPrice && value < minPrice) {
                    throw new Error("Maximum price cannot be less than minimum price");
                }
                return true;
            }),
        query("manufacturers")
            .optional()
            .customSanitizer((value: string | string[]): string[] => {
                if (typeof value === "string") {
                    return [value];
                }
                return value;
            })
            .isArray().withMessage("Manufacturers must be an array"),
        query("manufacturers.*")
            .notEmpty().withMessage("Each manufacturer is required")
            .isString().withMessage("Each manufacturer must be a string"),
        query("discounts")
            .optional()
            .custom((value: string | string[]) => {
                const validValues: string[] = ["Зі знижкою", "Без знижки"];

                if (typeof value === "string") {
                    return validValues.includes(value);
                }
                if (Array.isArray(value)) {
                    return value.every(item => validValues.includes(item));
                }

                return false;
            }).withMessage("Discounts must be 'Зі знижкою' or 'Без знижки'"),
        query("availability")
            .optional()
            .custom((value: string | string[]) => {
                const validValues: string[] = ["AVAILABLE", "NOT_AVAILABLE"];

                if (typeof value === "string") {
                    return validValues.includes(value);
                }
                if (Array.isArray(value)) {
                    return value.every((item: string) => validValues.includes(item));
                }

                return false;
            }).withMessage("Availability must be 'AVAILABLE' or 'NOT_AVAILABLE'"),
        query("search")
            .optional()
            .isString().withMessage("Search must be a string"),
        query("sort")
            .isIn(["priceAsc", "priceDesc", "nameAsc", "nameDesc"]).withMessage("Sort must be one of the following values: priceAsc, priceDesc, nameAsc, nameDesc")
    ],

    getProductByIdValidator: [
        param("id")
            .isUUID().withMessage("Product ID must be a valid UUID")
    ],

    updateProductValidator: [
        param("id")
            .isUUID().withMessage("Product ID must be a valid UUID"),
        body("discount")
            .notEmpty().withMessage("Discount is required")
            .isInt({ min: 0, max: 100 }).withMessage("Discount must be an integer between 0 and 100")
            .toInt(),
        body("isRecommended")
            .notEmpty().withMessage("isRecommended is required")
            .isBoolean().withMessage("isRecommended must be a boolean"),
        body("analogIds")
            .customSanitizer((value: string | string[]): string[] => {
                if (typeof value === "string") {
                    return [value];
                }
                return value;
            })
            .isArray().withMessage("Analog IDs must be an array"),
        body("analogIds.*")
            .isUUID().withMessage("Analog Product ID must be a valid UUID")
            .custom((value: string, { req: request }) => {
                const productId: string = request.params!.id;

                if (value === productId) {
                    throw new Error("A product cannot be an analog of itself");
                }

                return true;
            })
    ],

    getProductAnalogsValidator: [
        param("id")
            .isUUID().withMessage("Product ID must be a valid UUID")
    ],

    getFavoriteProductsValidator: [
        query("sort")
            .isIn(["priceAsc", "priceDesc", "nameAsc", "nameDesc"]).withMessage("Sort must be one of the following values: priceAsc, priceDesc, nameAsc, nameDesc")
    ],

    addProductToFavoritesValidator: [
        param("id")
            .isUUID().withMessage("Product ID must be a valid UUID")
    ],

    removeProductFromFavoritesValidator: [
        param("id")
            .isUUID().withMessage("Product ID must be a valid UUID")
    ],

    getOfflineFavoriteProductsValidator: [
        body("productIds")
            .isArray({ min: 1 }).withMessage("productIds must be a non-empty array"),
        body("productIds.*")
            .notEmpty().withMessage("Each Product ID is required")
            .isUUID().withMessage("Each Product ID must be a valid UUID")
    ],

    setOfflineFavoriteProductsValidator: [
        body("productIds")
            .isArray({ min: 1 }).withMessage("productIds must be a non-empty array"),
        body("productIds.*")
            .notEmpty().withMessage("Each Product ID is required")
            .isUUID().withMessage("Each Product ID must be a valid UUID")
    ]
}