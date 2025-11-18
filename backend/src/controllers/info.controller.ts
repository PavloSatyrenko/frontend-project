import { Request, Response } from "express";
import { StorageError } from '@supabase/storage-js';
import { infoService } from "services/info.service";

export const infoController = {
    async updateProductsDatabase(request: Request, response: Response): Promise<void> {
        try {
            const fileBuffer: Buffer = request.body;

            await infoService.updateProductsDatabase(fileBuffer);
            response.status(200).json({ message: "Database updated successfully" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateStoreProductsDatabase(request: Request, response: Response): Promise<void> {
        try {
            const fileBuffer: Buffer = request.body;

            await infoService.updateProductsDatabase(fileBuffer);

            await infoService.uploadFileToStorage(fileBuffer, "DB files", `store-db.csv`);

            response.status(200).json({ message: "Store products database updated successfully" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateSupplyProductsDatabase(request: Request, response: Response): Promise<void> {
        try {
            const fileBuffer: Buffer = request.body;

            await infoService.updateProductsDatabase(fileBuffer);

            await infoService.uploadFileToStorage(fileBuffer, "DB files", `supply-db.csv`);

            response.status(200).json({ message: "Supply products database updated successfully" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateAnalogsDatabase(request: Request, response: Response): Promise<void> {
        try {
            const fileBuffer: Buffer = request.body;

            await infoService.updateAnalogsDatabase(fileBuffer);
            response.status(200).json({ message: "Database updated successfully" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateCategoriesDatabase(request: Request, response: Response): Promise<void> {
        try {
            const fileBuffer: Buffer = request.body;

            await infoService.updateCategoriesDatabase(fileBuffer);

            await infoService.uploadFileToStorage(fileBuffer, "DB files", `categories-db.csv`);

            response.status(200).json({ message: "Database updated successfully" });
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async uploadFileToStorage(request: Request, response: Response): Promise<void> {
        try {
            const fileBuffer: Buffer = request.body;

            const error: StorageError | null = await infoService.uploadFileToStorage(fileBuffer);

            if (error) {
                response.status(500).json({ message: "Failed to upload file to storage", error });
            }
            else {
                response.status(200).json({ message: "File uploaded successfully" });
            }
        }
        catch (error) {
            response.status(500).json({ message: "Internal server error" });
        }
    }
}