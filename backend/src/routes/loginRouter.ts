import { Router } from "express";
import loginController from "../controllers/loginController";
import { asyncHandler } from "../middlewares";

const loginRouter: Router = Router();

loginRouter.post("/", asyncHandler(loginController.login));

export default loginRouter;
