import { authValidator } from './../middlewares/auth.validator';
import { authController } from "controllers/auth.controller";
import { Router } from "express";
import { authMiddleware } from "middlewares/auth.middleware";
import { generalLimiter, loginLimiter, signUpLimiter } from 'middlewares/limiter';
import { validate } from 'utils/validate';

const router: Router = Router();

router.post("/sign-up", signUpLimiter, authValidator.signUpValidator, validate, authController.signUp);
router.post("/login", loginLimiter, authValidator.loginValidator, validate, authController.login);
router.post("/logout", generalLimiter, authMiddleware, authController.logout);
router.post("/refresh", generalLimiter, authValidator.refreshTokenValidator, validate, authController.refreshToken);
router.post("/create-admin", generalLimiter, authController.createAdmin);

export default router;