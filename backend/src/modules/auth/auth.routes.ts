import { asyncHandler } from "@shared/middlewares/index.js";
import { Router } from "express";
import authController from "./auth.controller.js";

const authRouter: Router = Router();

authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/signup", asyncHandler(authController.signup));

export default authRouter;
