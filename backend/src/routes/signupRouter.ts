import { Router } from "express";
import signupController from "../controllers/signupController";
import { asyncHandler } from "../middlewares";

const signupRouter: Router = Router();

signupRouter.post("/", asyncHandler(signupController.signup));

export default signupRouter;
