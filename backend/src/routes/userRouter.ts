import { Router } from "express";
import userController from "../controllers/userController";
import { asyncHandler } from "../middlewares";

const userRouter: Router = Router();

userRouter.get("/", asyncHandler(userController.getAll));
userRouter.get("/:id", asyncHandler(userController.getOne));
userRouter.post("/", asyncHandler(userController.createNew));
userRouter.delete("/:id", asyncHandler(userController.deleteOne));
userRouter.delete("/", asyncHandler(userController.deleteAll));

export default userRouter;
