import { body, param, query } from "express-validator";

export const orderValidator = {
    getOrdersValidator: [
        query("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("pageSize")
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage("Page size must be a positive integer between 1 and 100"),
        query("period")
            .optional()
            .isIn(["MONTH", "HALF_YEAR", "YEAR"]).withMessage("Period must be one of the following values: MONTH, HALF_YEAR, YEAR"),
        query("status")
            .optional()
            .isIn(["ACCEPTED", "PROCESSING", "PREPARING", "SENT", "COMPLETED", "CANCELLED"]).withMessage("Status must be one of the following values: ACCEPTED, PROCESSING, PREPARING, SENT, COMPLETED, CANCELLED"),
        query("search")
            .optional()
            .isInt().withMessage("Search must be a number"),
    ],

    getUserOrdersValidator: [
        query("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("pageSize")
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage("Page size must be a positive integer between 1 and 100"),
        query("period")
            .optional()
            .isIn(["MONTH", "HALF_YEAR", "YEAR"]).withMessage("Period must be one of the following values: MONTH, HALF_YEAR, YEAR"),
        query("search")
            .optional()
            .isInt().withMessage("Search must be a number"),
    ],

    getUserOrdersAdminValidator: [
        query("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("pageSize")
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage("Page size must be a positive integer between 1 and 100"),
        param("userId")
            .notEmpty().withMessage("User ID is required")
            .isString().withMessage("User ID must be a string")
            .isUUID().withMessage("User ID must be a valid UUID"),
    ],

    createOrderValidator: [
        body("phone")
            .if((_, { req }) => !req.user)
            .trim()
            .notEmpty().withMessage("Phone number is required")
            .isMobilePhone("uk-UA").withMessage("Please provide a valid phone number"),
        body("name")
            .if((_, { req }) => !req.user)
            .trim()
            .notEmpty().withMessage("Name is required")
            .isString().withMessage("Name must be a string")
            .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
            .escape(),
        body("surname")
            .if((_, { req }) => !req.user)
            .trim()
            .notEmpty().withMessage("Surname is required")
            .isString().withMessage("Surname must be a string")
            .isLength({ min: 2, max: 100 }).withMessage("Surname must be between 2 and 100 characters")
            .escape(),
        body("email")
            .if((_, { req }) => !req.user)
            .optional()
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail(),
        body("deliveryMethod")
            .notEmpty().withMessage("Delivery method is required")
            .isIn(["PICKUP", "COURIER", "PARCEL_LOCKER", "POST_OFFICE"]).withMessage("Delivery method must be either PICKUP, COURIER, PARCEL_LOCKER or POST_OFFICE"),
        body("deliveryPrice")
            .notEmpty().withMessage("Delivery price is required")
            .isFloat({ min: 0 }).withMessage("Delivery price must be a non-negative number"),
        body("orderItems")
            .notEmpty().withMessage("Order items are required")
            .isArray().withMessage("Order items must be an array"),
        body("orderItems.*.productId")
            .notEmpty().withMessage("Product ID is required")
            .isUUID().withMessage("Product ID must be a valid UUID"),
        body("orderItems.*.amount")
            .notEmpty().withMessage("Amount is required")
            .isInt({ gt: 0 }).withMessage("Amount must be a positive integer"),
        body("invoice")
            .optional()
            .isString().withMessage("Invoice must be a string")
    ],

    getOrderInfoValidator: [
        param("orderNumber")
            .notEmpty().withMessage("Order number is required")
            .isInt({ min: 0 }).withMessage("Order number must be a non-negative integer"),
    ],

    updateOrderStatusValidator: [
        param("orderId")
            .notEmpty().withMessage("Order ID is required")
            .isUUID().withMessage("Order ID must be a valid UUID"),
        body("status")
            .notEmpty().withMessage("Status is required")
            .isIn(["ACCEPTED", "PROCESSING", "PREPARING", "SENT", "COMPLETED", "CANCELLED"]).withMessage("Status must be one of the following values: ACCEPTED, PROCESSING, PREPARING, SENT, COMPLETED, CANCELLED"),
    ],
};