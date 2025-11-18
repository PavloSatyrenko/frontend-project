import { vinController } from "controllers/vin.controller";
import { Router } from "express";
import { adminMiddleware } from "middlewares/admin.middleware";
import { authMiddleware } from "middlewares/auth.middleware";
import { vinValidator } from "middlewares/vin.validator";
import { validate } from "utils/validate";

const router: Router = Router();

router.get("/", authMiddleware, adminMiddleware, vinController.getAllRequests);
router.post("/", vinValidator.sendRequestValidator, validate, vinController.sendRequest);

export default router;