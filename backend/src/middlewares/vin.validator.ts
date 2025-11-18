import { body } from "express-validator";

export const vinValidator = {
    sendRequestValidator: [
        body("name")
            .trim()
            .notEmpty().withMessage("Name is required")
            .isString().withMessage("Name must be a string")
            .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
            .escape(),
        body("phone")
            .trim()
            .notEmpty().withMessage("Phone number is required")
            .isMobilePhone("uk-UA").withMessage("Please provide a valid phone number"),
        body("vin")
            .trim()
            .notEmpty().withMessage("VIN is required")
            .isString().withMessage("VIN must be a string")
            .isLength({ min: 17, max: 17 }).withMessage("VIN must be exactly 17 characters")
            .escape(),
        body("text")
            .trim()
            .isString().withMessage("Text must be a string")
            .isLength({ max: 2000 }).withMessage("Text cannot exceed 2000 characters")
            .escape()
    ]
}