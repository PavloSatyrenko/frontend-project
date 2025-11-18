import { body, cookie } from "express-validator";

export const authValidator = {
    signUpValidator: [
        body("phone")
            .trim()
            .notEmpty().withMessage("Phone number is required")
            .isMobilePhone("uk-UA").withMessage("Please provide a valid phone number"),
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
        body("role")
            .notEmpty().withMessage("Role is required")
            .isString().withMessage("Role must be a string")
            .isIn(["WHOLESALE", "SERVICE_STATION", "RETAIL"]).withMessage("Role must be either 'WHOLESALE', 'SERVICE_STATION' or 'RETAIL'"),
        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
            .isString().withMessage("Password must be a string")
            .isLength({ min: 6, max: 100 }).withMessage("Password must be between 6 and 100 characters")
    ],
    loginValidator: [
        body("phone")
            .trim()
            .notEmpty().withMessage("Phone number is required")
            .isMobilePhone("uk-UA").withMessage("Please provide a valid phone number"),
        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
            .isString().withMessage("Password must be a string")
            .isLength({ min: 6, max: 100 }).withMessage("Password must be between 6 and 100 characters")
    ],
    refreshTokenValidator: [
        body("refreshToken")
            .trim()
            .notEmpty().withMessage("Refresh token is required")
            .isString().withMessage("Refresh token must be a string")
    ]
}