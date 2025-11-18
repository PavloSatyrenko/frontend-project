import { body, header, query } from "express-validator";
import { Request } from "express";

export const infoValidator = {
    databaseUpdateValidator: [
        header("content-type")
            .equals("application/octet-stream")
            .withMessage("Invalid content type. Expected application/octet-stream"),
        body()
            .custom((value, { req }) => {
                const request = req as Request;
                
                if (!Buffer.isBuffer(request.body)) {
                    throw new Error("Invalid file format. File data expected");
                }
                
                if (request.body.length === 0) {
                    throw new Error("File cannot be empty");
                }
                
                const maxFileSize: number = 100 * 1024 * 1024; // 100MB
                if (request.body.length > maxFileSize) {
                    throw new Error("File size exceeds maximum allowed size of 100MB");
                }
                
                return true;
            }),
        query("password")
            .exists()
            .withMessage("Password is required")
            .isString()
            .withMessage("Password must be a string")
            .custom((value: string) => {
                const validPassword: string | undefined = process.env.DB_UPDATE_PASSWORD;
                if (!validPassword) {
                    throw new Error("Server configuration error: valid password not set");
                }
                if (value !== validPassword) {
                    throw new Error("Invalid password");
                }
                return true;
            })
    ]
}