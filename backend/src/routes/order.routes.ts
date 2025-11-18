import { orderController } from "controllers/order.controller";
import { Router } from "express";
import { adminMiddleware } from "middlewares/admin.middleware";
import { authMiddleware, optionalAuthMiddleware } from "middlewares/auth.middleware";
import { orderValidator } from "middlewares/order.validator";
import { validate } from "utils/validate";

const router: Router = Router();

router.get("/", authMiddleware, adminMiddleware, orderValidator.getOrdersValidator, validate, orderController.getOrders);
router.get("/me", authMiddleware, orderValidator.getUserOrdersValidator, validate, orderController.getUserOrders);
router.get("/user/:userId", authMiddleware, adminMiddleware, orderValidator.getUserOrdersAdminValidator, validate, orderController.getUserOrdersAdmin);
router.post("/", optionalAuthMiddleware, orderValidator.createOrderValidator, validate, orderController.createOrder);
router.get("/:orderNumber/info", orderValidator.getOrderInfoValidator, validate, orderController.getOrderInfo);
router.put("/:orderId/status", authMiddleware, adminMiddleware, orderValidator.updateOrderStatusValidator, validate, orderController.updateOrderStatus);

export default router;