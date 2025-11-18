import { cartController } from "controllers/cart.contoller";
import { Router } from "express";
import { authMiddleware } from "middlewares/auth.middleware";
import { cartValidator } from "middlewares/cart.validator";
import { validate } from "utils/validate";

const router: Router = Router();

router.get("/", authMiddleware, cartController.getShoppingCart);
router.post("/", authMiddleware, cartValidator.addToCartValidator, validate, cartController.addToCart);
router.post("/multiple", authMiddleware, cartValidator.addMultipleToCartValidator, validate, cartController.addMultipleToCart);
router.put("/toggle", authMiddleware, cartValidator.toggleCartValidator, validate, cartController.toggleCart);
router.delete("/:id", authMiddleware, cartValidator.removeFromCartValidator, validate, cartController.removeFromCart);
router.put("/:id", authMiddleware, cartValidator.updateCartItemValidator, validate, cartController.updateCartItem);
router.post("/offline", cartValidator.getOfflineCartValidator, validate, cartController.getOfflineCart);
router.post("/offline/set", authMiddleware, cartValidator.setOfflineCartValidator, validate, cartController.setOfflineCart);

export default router;