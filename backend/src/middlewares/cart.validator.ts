import { body, param } from "express-validator";

export const cartValidator = {
    addToCartValidator: [
        body("productId")
            .notEmpty().withMessage("Product ID is required")
            .isUUID().withMessage("Product ID must be a valid UUID")
    ],

    addMultipleToCartValidator: [
        body("productIds")
            .isArray({ min: 1 }).withMessage("productIds must be a non-empty array"),
        body("productIds.*")
            .notEmpty().withMessage("Each Product ID is required")
            .isUUID().withMessage("Each Product ID must be a valid UUID")
    ],

    toggleCartValidator: [
        body("isChecked")
            .notEmpty().withMessage("isChecked is required")
            .isBoolean().withMessage("isChecked must be a boolean value")
    ],

    removeFromCartValidator: [
        param("id")
            .notEmpty().withMessage("Cart Item ID is required")
            .isUUID().withMessage("Cart Item ID must be a valid UUID")
    ],

    updateCartItemValidator: [
        param("id")
            .notEmpty().withMessage("Cart Item ID is required")
            .isUUID().withMessage("Cart Item ID must be a valid UUID"),
        body("amount")
            .notEmpty().withMessage("Amount is required")
            .isInt({ min: 1 }).withMessage("Amount must be an integer greater than 0"),
        body("isChecked")
            .notEmpty().withMessage("isChecked is required")
            .isBoolean().withMessage("isChecked must be a boolean value")
    ],

    getOfflineCartValidator: [
        body("cartItems")
            .isArray().withMessage("cartItems must be an array"),
        body("cartItems.*.productId")
            .notEmpty().withMessage("Product ID is required")
            .isUUID().withMessage("Product ID must be a valid UUID"),
        body("cartItems.*.amount")
            .notEmpty().withMessage("Amount is required")
            .isInt({ min: 1, max: 10 }).withMessage("Amount must be an integer between 1 and 10"),
        body("cartItems.*.isChecked")
            .notEmpty().withMessage("isChecked is required")
            .isBoolean().withMessage("isChecked must be a boolean value")
    ],

    setOfflineCartValidator: [
        body("cartItems")
            .isArray().withMessage("cartItems must be an array"),
        body("cartItems.*.productId")
            .notEmpty().withMessage("Product ID is required")
            .isUUID().withMessage("Product ID must be a valid UUID"),
        body("cartItems.*.amount")
            .notEmpty().withMessage("Amount is required")
            .isInt({ min: 1, max: 10 }).withMessage("Amount must be an integer between 1 and 10"),
        body("cartItems.*.isChecked")
            .notEmpty().withMessage("isChecked is required")
            .isBoolean().withMessage("isChecked must be a boolean value")
    ]
}