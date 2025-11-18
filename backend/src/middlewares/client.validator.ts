import { param, body, query } from "express-validator";

export const clientValidator = {
    getClientsValidator: [
        query("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("pageSize")
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage("Page size must be a positive integer between 1 and 100"),
        query("role")
            .optional()
            .isString().withMessage("Role must be a string")
            .isIn(["WHOLESALE", "SERVICE_STATION", "RETAIL"]).withMessage("Role must be either 'WHOLESALE', 'SERVICE_STATION' or 'RETAIL'"),
        query("search")
            .optional()
            .isString().withMessage("Search must be a string"),
    ],

    updateClientValidator: [
        param("id")
            .isUUID().withMessage("Client ID must be a valid UUID"),
        body("name")
            .trim()
            .notEmpty().withMessage("Name is required")
            .isString().withMessage("Name must be a string")
            .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
            .escape(),
        body("surname")
            .trim()
            .notEmpty().withMessage("Surname is required")
            .isString().withMessage("Surname must be a string")
            .isLength({ min: 2, max: 100 }).withMessage("Surname must be between 2 and 100 characters")
            .escape(),
        body("phone")
            .trim()
            .notEmpty().withMessage("Phone number is required")
            .isMobilePhone("uk-UA").withMessage("Please provide a valid phone number"),
        body("role")
            .notEmpty().withMessage("Role is required")
            .isString().withMessage("Role must be a string")
            .isIn(["WHOLESALE", "SERVICE_STATION", "RETAIL"]).withMessage("Role must be either 'WHOLESALE', 'SERVICE_STATION' or 'RETAIL'"),
        body("email")
            .optional()
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail(),
        body("discount")
            .notEmpty().withMessage("Discount is required")
            .isInt({ min: 0, max: 100 }).withMessage("Discount must be an integer between 0 and 100")
            .toInt()
    ],

    updatePersonalDataValidator: [
        body("name")
            .trim()
            .notEmpty().withMessage("Name is required")
            .isString().withMessage("Name must be a string")
            .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
            .escape(),
        body("surname")
            .trim()
            .notEmpty().withMessage("Surname is required")
            .isString().withMessage("Surname must be a string")
            .isLength({ min: 2, max: 100 }).withMessage("Surname must be between 2 and 100 characters")
            .escape(),
        body("phone")
            .trim()
            .notEmpty().withMessage("Phone number is required")
            .isMobilePhone("uk-UA").withMessage("Please provide a valid phone number"),
        body("email")
            .optional({ nullable: true, checkFalsy: true })
            .trim()
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail(),
        body("password")
            .optional()
            .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ]
}