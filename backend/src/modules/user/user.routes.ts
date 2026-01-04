import { Router } from "express";
import { asyncHandler } from "../../shared/middlewares";
import userController from "./user.controller";

const userRouter: Router = Router();

userRouter.get("/", asyncHandler(userController.getAll));
userRouter.get("/:id", asyncHandler(userController.getOne));
userRouter.delete("/:id", asyncHandler(userController.deleteOne));
userRouter.delete("/", asyncHandler(userController.deleteAll));

export default userRouter;
