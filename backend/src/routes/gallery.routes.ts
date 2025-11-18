import { galleryController } from "controllers/gallery.controller";
import { Router } from "express";
import { adminMiddleware } from "middlewares/admin.middleware";
import { authMiddleware } from "middlewares/auth.middleware";
import { galleryValidator } from "middlewares/gallery.validator";
import { validate } from "utils/validate";

const router: Router = Router();

router.get("/", galleryController.getGalleryPages);
router.get("/admin", authMiddleware, adminMiddleware, galleryValidator.getAdminGalleryPagesValidator, validate, galleryController.getAdminGalleryPages);
router.get("/image-url", authMiddleware, adminMiddleware, galleryController.getPresignedUrlToUploadImage);
router.post("/", authMiddleware, adminMiddleware, galleryValidator.addGalleryPageValidator, validate, galleryController.addGalleryPage);
router.put("/:id", authMiddleware, adminMiddleware, galleryValidator.updateGalleryPageValidator, validate, galleryController.updateGalleryPage);
router.put("/:id/order", authMiddleware, adminMiddleware, galleryValidator.updateGalleryPageOrderValidator, validate, galleryController.updateGalleryPageOrder);
router.delete("/:id", authMiddleware, adminMiddleware, galleryValidator.deleteGalleryPageValidator, validate, galleryController.deleteGalleryPage);

export default router;