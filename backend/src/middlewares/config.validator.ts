import { body } from "express-validator";

export const configValidator = {
    setConfigValueValidator: [
        body("key")
            .notEmpty().withMessage("Key is required")
            .isString().withMessage("Key must be a string"),
        body("value")
            .optional()
            .isString().withMessage("Value must be a string"),
        body("group")
            .notEmpty().withMessage("Group is required")
            .isString().withMessage("Group must be a string")
    ]
}