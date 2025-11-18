import { infoRepository } from "repositories/info.repository";
import { StorageError } from "@supabase/storage-js";

export const infoService = {
    async updateProductsDatabase(fileBuffer: Buffer): Promise<void> {
        try {
            await infoRepository.updateProductsDatabase(fileBuffer);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    },

    async updateAnalogsDatabase(fileBuffer: Buffer): Promise<void> {
        try {
            await infoRepository.updateAnalogsDatabase(fileBuffer);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    },

    async updateCategoriesDatabase(fileBuffer: Buffer): Promise<void> {
        try {
            await infoRepository.updateCategoriesDatabase(fileBuffer);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    },

    async uploadFileToStorage(fileBuffer: Buffer, bucketName?: string, fileName?: string): Promise<StorageError | null> {
        try {
            const dbBucketName: string = bucketName ?? "DB files";
            const dbFileName: string = fileName ?? `db-${Date.now()}.csv`;

            return await infoRepository.uploadFileToStorage(fileBuffer, dbBucketName, dbFileName);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
}