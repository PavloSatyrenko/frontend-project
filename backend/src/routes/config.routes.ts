import { configController } from "controllers/config.controller";
import { Router } from "express";
import { adminMiddleware } from "middlewares/admin.middleware";
import { authMiddleware } from "middlewares/auth.middleware";
import { configValidator } from "middlewares/config.validator";
import { validate } from "utils/validate";

const router: Router = Router();

router.get("/", configController.getConfig);
router.put("/", authMiddleware, adminMiddleware, configValidator.setConfigValueValidator, validate, configController.setConfigValue);

export default router;