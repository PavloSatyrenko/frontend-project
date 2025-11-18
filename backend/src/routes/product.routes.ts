import { productController } from "controllers/product.controller";
import { productValidator } from "middlewares/product.validator";
import { Router } from "express";
import { validate } from "utils/validate";
import { adminMiddleware } from "middlewares/admin.middleware";
import { authMiddleware, optionalAuthMiddleware } from "middlewares/auth.middleware";

const router: Router = Router();

router.get("/", optionalAuthMiddleware, productValidator.getProductsValidator, validate, productController.getProducts);
router.get("/recommendations", optionalAuthMiddleware, productController.getRecommendedProducts);
router.get("/me/favorites", authMiddleware, productValidator.getFavoriteProductsValidator, validate, productController.getFavoriteProducts);
router.post("/me/favorites/:id", authMiddleware, productValidator.addProductToFavoritesValidator, validate, productController.addProductToFavorites);
router.delete("/me/favorites/:id", authMiddleware, productValidator.removeProductFromFavoritesValidator, validate, productController.removeProductFromFavorites);
router.post("/favorites/offline", productValidator.getOfflineFavoriteProductsValidator, validate, productController.getOfflineFavoriteProducts);
router.post("/favorites/offline/set", authMiddleware, productValidator.setOfflineFavoriteProductsValidator, validate, productController.setOfflineFavoriteProducts);
router.get("/:id", optionalAuthMiddleware, productValidator.getProductByIdValidator, validate, productController.getProductById);
router.get("/:id/analogs", optionalAuthMiddleware, productValidator.getProductAnalogsValidator, validate, productController.getProductAnalogs);
router.put("/:id", authMiddleware, adminMiddleware, productValidator.updateProductValidator, validate, productController.updateProduct);

export default router;