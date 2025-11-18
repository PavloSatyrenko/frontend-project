import { filterController } from "controllers/filter.contoller";
import { filterValidator } from "middlewares/filter.validator";
import { Router } from "express";

const router: Router = Router();

router.get("/", filterValidator.getFilters, filterController.getFilters);

export default router;