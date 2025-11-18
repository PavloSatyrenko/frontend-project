
import { query } from "express-validator";

export const filterValidator = {
    getFilters: [
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
        query("search")
            .optional()
            .isString().withMessage("Search must be a string"),
    ],
}