import { GalleryPage } from "@prisma/client";
import { galleryRepository } from "repositories/gallery.repository";

export const galleryService = {
    async getGalleryPages(): Promise<GalleryPage[]> {
        return await galleryRepository.getGalleryPages();
    },

    async getAdminGalleryPages(isActive?: string): Promise<GalleryPage[]> {
        let isActiveBoolean: boolean | undefined = undefined;

        switch (isActive) {
            case "ACTIVE":
                isActiveBoolean = true;
                break;
            case "INACTIVE":
                isActiveBoolean = false;
                break;
        }

        return await galleryRepository.getAdminGalleryPages(isActiveBoolean);
    },

    async getPresignedUrlToUploadImage(): Promise<string> {
        return await galleryRepository.getPresignedUrlToUploadImage();
    },

    async addGalleryPage(title: string, description: string, imageUrl: string): Promise<void> {
        return await galleryRepository.addGalleryPage(title, description, imageUrl);
    },

    async updateGalleryPage(id: string, title: string, description: string, isActive: boolean, imageUrl?: string): Promise<void> {
        return await galleryRepository.updateGalleryPage(id, title, description, isActive, imageUrl);
    },

    async updateGalleryPageOrder(id: string, orderDirection: "UP" | "DOWN"): Promise<void> {
        return await galleryRepository.updateGalleryPageOrder(id, orderDirection);
    },

    async deleteGalleryPage(id: string): Promise<void> {
        return await galleryRepository.deleteGalleryPage(id);
    }
}