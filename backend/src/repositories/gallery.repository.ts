import { GalleryPage, PrismaClient } from "@prisma/client";
import { StorageError } from "@supabase/storage-js";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "config/env";

const prisma: PrismaClient = new PrismaClient();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const galleryRepository = {
    async getGalleryPages(): Promise<GalleryPage[]> {
        return await prisma.galleryPage.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                order: "asc"
            }
        });
    },

    async getAdminGalleryPages(isActive?: boolean): Promise<GalleryPage[]> {
        return await prisma.galleryPage.findMany({
            where: {
                ...(
                    isActive !== undefined && {
                        isActive: isActive
                    }
                )
            },
            orderBy: {
                order: "asc"
            }
        });
    },

    async getPresignedUrlToUploadImage(): Promise<string> {
        const bucketName: string = "Gallery images";
        const imageName: string = `gallery-${Date.now()}.jpg`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUploadUrl(imageName);

        if (error) {
            throw new Error("Failed to generate presigned URL");
        }

        return data.signedUrl;
    },

    async addGalleryPage(title: string, description: string, imageUrl: string): Promise<void> {
        const maxOrderPage: GalleryPage | null = await prisma.galleryPage.findFirst({
            orderBy: {
                order: "desc"
            }
        });

        await prisma.galleryPage.create({
            data: {
                title: title,
                description: description,
                image: imageUrl,
                order: maxOrderPage ? maxOrderPage.order + 1 : 1,
            }
        });
    },

    async updateGalleryPage(id: string, title: string, description: string, isActive: boolean, imageUrl?: string): Promise<void> {
        const page: GalleryPage | null = await prisma.galleryPage.findUnique({
            where: {
                id: id
            }
        });

        if (!page) {
            throw new Error("Gallery page not found");
        }

        await prisma.galleryPage.update({
            where: {
                id: id
            },
            data: {
                title,
                description,
                isActive,
                ...(
                    imageUrl ? {
                        image: imageUrl
                    } : {}
                )
            }
        });
    },

    async updateGalleryPageOrder(id: string, orderDirection: "UP" | "DOWN"): Promise<void> {
        const page: GalleryPage | null = await prisma.galleryPage.findUnique({
            where: {
                id: id
            }
        });

        if (!page) {
            throw new Error("Gallery page not found");
        }

        let swapPage: GalleryPage | null;
        if (orderDirection === "UP") {
            swapPage = await prisma.galleryPage.findFirst({
                where: {
                    order: {
                        lt: page.order
                    }
                },
                orderBy: {
                    order: "desc"
                }
            });
        }
        else {
            swapPage = await prisma.galleryPage.findFirst({
                where: {
                    order: {
                        gt: page.order
                    }
                },
                orderBy: {
                    order: "asc"
                }
            });
        }

        if (!swapPage) {
            throw new Error("Cannot move the page further in this direction");
        }

        await prisma.galleryPage.update({
            where: {
                id: swapPage.id
            },
            data: {
                order: page.order
            }
        });

        await prisma.galleryPage.update({
            where: {
                id: page.id
            },
            data: {
                order: swapPage.order
            }
        });
    },

    async deleteGalleryPage(id: string): Promise<void> {
        await prisma.galleryPage.delete({
            where: {
                id: id
            }
        });
    }
}