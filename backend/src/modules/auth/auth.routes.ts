import { loginSchema, signupSchema } from "@modules/auth/auth.validation.js";
import { asyncHandler, bodyValidation } from "@shared/middlewares/index.js";
import { Router } from "express";
import * as authController from "./auth.controller.js";

const authRouter: Router = Router();

authRouter.post(
	"/login",
	bodyValidation(loginSchema),
	asyncHandler(authController.login)
);
authRouter.post(
	"/signup",
	bodyValidation(signupSchema),
	asyncHandler(authController.signup)
);

export default authRouter;
