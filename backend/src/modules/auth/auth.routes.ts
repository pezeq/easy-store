import { Router } from "express";
import { asyncHandler } from "../../middlewares";
import authController from "./auth.controller";

const authRouter: Router = Router();

authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/signup", asyncHandler(authController.signup));

export default authRouter;
