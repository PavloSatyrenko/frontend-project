import { clientController } from "controllers/client.controller";
import { Router } from "express";
import { adminMiddleware } from "middlewares/admin.middleware";
import { authMiddleware } from "middlewares/auth.middleware";
import { clientValidator } from "middlewares/client.validator";
import { validate } from "utils/validate";

const router: Router = Router();

router.get("/", authMiddleware, adminMiddleware, clientValidator.getClientsValidator, validate, clientController.getClients);
router.get("/me", authMiddleware, clientController.getPersonalData);
router.put("/me", authMiddleware, clientValidator.updatePersonalDataValidator, validate, clientController.updatePersonalData);
router.put("/:id", authMiddleware, adminMiddleware, clientValidator.updateClientValidator, validate, clientController.updateClient);

export default router;