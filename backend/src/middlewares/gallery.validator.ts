import { body, param, query } from "express-validator";

export const galleryValidator = {
    getAdminGalleryPagesValidator: [
        query("isActive")
            .optional()
            .isIn(["ACTIVE", "INACTIVE"]).withMessage("isActive must be either ACTIVE or INACTIVE")
    ],

    addGalleryPageValidator: [
        body("title")
            .trim()
            .notEmpty().withMessage("Title is required")
            .isString().withMessage("Title must be a string")
            .isLength({ max: 255 }).withMessage("Title must be at most 255 characters long")
            .escape(),
        body("description")
            .trim()
            .notEmpty().withMessage("Description is required")
            .isString().withMessage("Description must be a string")
            .escape(),
        body("imageKey")
            .notEmpty().withMessage("Image Key is required")
            .isString().withMessage("Image Key must be a string")
    ],

    updateGalleryPageValidator: [
        param("id")
            .notEmpty().withMessage("ID is required")
            .isString().withMessage("ID must be a string")
            .isUUID().withMessage("ID must be a valid UUID"),
        body("title")
            .trim()
            .notEmpty().withMessage("Title cannot be empty")
            .isString().withMessage("Title must be a string")
            .isLength({ max: 255 }).withMessage("Title must be at most 255 characters long")
            .escape(),
        body("description")
            .trim()
            .notEmpty().withMessage("Description cannot be empty")
            .isString().withMessage("Description must be a string")
            .escape(),
        body("isActive")
            .notEmpty().withMessage("isActive cannot be empty")
            .isBoolean().withMessage("isActive must be a boolean value"),
        body("imageKey")
            .optional()
            .isString().withMessage("Image Key must be a string"),
    ],

    updateGalleryPageOrderValidator: [
        param("id")
            .notEmpty().withMessage("ID is required")
            .isString().withMessage("ID must be a string")
            .isUUID().withMessage("ID must be a valid UUID"),
        body("orderDirection")
            .notEmpty().withMessage("Order Direction is required")
            .isIn(["UP", "DOWN"]).withMessage("Order Direction must be one of the following values: UP, DOWN")
    ],

    deleteGalleryPageValidator: [
        param("id")
            .notEmpty().withMessage("ID is required")
            .isString().withMessage("ID must be a string")
            .isUUID().withMessage("ID must be a valid UUID")
    ]
}