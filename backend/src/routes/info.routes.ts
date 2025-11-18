import { infoController } from "controllers/info.controller";
import { infoValidator } from "middlewares/info.validator";
import { Router } from "express";
import { validate } from "utils/validate";

const router: Router = Router();

router.put("/products", infoValidator.databaseUpdateValidator, validate, infoController.updateProductsDatabase);
router.put("/store-products", infoValidator.databaseUpdateValidator, validate, infoController.updateStoreProductsDatabase);
router.put("/supply-products", infoValidator.databaseUpdateValidator, validate, infoController.updateSupplyProductsDatabase);
router.put("/analogs", infoValidator.databaseUpdateValidator, validate, infoController.updateAnalogsDatabase);
router.put("/categories", infoValidator.databaseUpdateValidator, validate, infoController.updateCategoriesDatabase);
router.put("/upload", infoValidator.databaseUpdateValidator, validate, infoController.uploadFileToStorage);

export default router;