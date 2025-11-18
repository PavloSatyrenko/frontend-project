import { SUPABASE_IMAGE_URL } from './../config/env';
import { GalleryPage } from "@prisma/client";
import { Request, Response } from "express";
import { galleryService } from "services/gallery.services";

export const galleryController = {
    async getGalleryPages(request: Request, response: Response): Promise<void> {
        try {
            const galleryPages: GalleryPage[] = await galleryService.getGalleryPages();

            response.status(200).json(galleryPages);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async getAdminGalleryPages(request: Request, response: Response): Promise<void> {
        try {
            const isActive: string | undefined = request.query.isActive ? request.query.isActive as string : undefined;

            const galleryPages: GalleryPage[] = await galleryService.getAdminGalleryPages(isActive);

            response.status(200).json(galleryPages);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async getPresignedUrlToUploadImage(request: Request, response: Response): Promise<void> {
        try {
            const presignedUrl: string = await galleryService.getPresignedUrlToUploadImage();

            response.status(200).json({ url: presignedUrl });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async addGalleryPage(request: Request, response: Response): Promise<void> {
        try {
            const title: string = request.body.title;
            const description: string = request.body.description;
            const imageUrl: string = SUPABASE_IMAGE_URL + request.body.imageKey;

            await galleryService.addGalleryPage(title, description, imageUrl);

            response.status(200).json({ message: "Gallery page added successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateGalleryPage(request: Request, response: Response): Promise<void> {
        try {
            const id: string = request.params.id;
            const title: string = request.body.title;
            const description: string = request.body.description;
            const isActive: boolean = request.body.isActive;

            let imageUrl: string | undefined;
            if (request.body.imageKey) {
                imageUrl = SUPABASE_IMAGE_URL + request.body.imageKey;
            }

            await galleryService.updateGalleryPage(id, title, description, isActive, imageUrl);

            response.status(200).json({ message: "Gallery page updated successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async updateGalleryPageOrder(request: Request, response: Response): Promise<void> {
        try {
            const galleryPageId: string = request.params.id;
            const orderDirection: "UP" | "DOWN" = request.body.orderDirection;

            await galleryService.updateGalleryPageOrder(galleryPageId, orderDirection);

            response.status(200).json({ message: "Gallery page order updated successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    async deleteGalleryPage(request: Request, response: Response): Promise<void> {
        try {
            const id: string = request.params.id;

            await galleryService.deleteGalleryPage(id);

            response.status(200).json({ message: "Gallery page deleted successfully" });
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    }
};