import { param, query } from "express-validator";

export const categoryValidator = {
    getCategoriesValidator: [
        query("amount")
            .optional()
            .notEmpty().withMessage("Amount is required")
            .isInt({ min: 1 }).withMessage("Amount must be a positive integer")
    ],

    getCategoryByIdValidator: [
        param("id")
            .notEmpty().withMessage("Category ID is required")
            .isUUID().withMessage("Category ID must be a valid UUID")
    ]
}