import { asyncHandler } from "@shared/middlewares/index.js";
import { Router } from "express";
import userController from "./user.controller.js";

const userRouter: Router = Router();

userRouter.get("/", asyncHandler(userController.getAll));
userRouter.get("/:id", asyncHandler(userController.getOne));
userRouter.delete("/:id", asyncHandler(userController.deleteOne));
userRouter.delete("/", asyncHandler(userController.deleteAll));

export default userRouter;
