import { categoryController } from "controllers/category.controller";
import { Router } from "express";
import { categoryValidator } from "middlewares/category.validator";
import { validate } from "utils/validate";

const router: Router = Router();

router.get("/", categoryValidator.getCategoriesValidator, validate, categoryController.getCategories);
router.get("/:id", categoryValidator.getCategoryByIdValidator, validate, categoryController.getCategoryById);

export default router;