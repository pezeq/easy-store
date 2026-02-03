import {
	asyncHandler,
	paramsValidation,
	queryValidation,
} from "@shared/middlewares/index.js";
import { idSchema, paginationSchema } from "@shared/utils/common.validation.js";
import { Router } from "express";
import * as userController from "./user.controller.js";

const userRouter: Router = Router();

userRouter.get(
	"/",
	queryValidation(paginationSchema),
	asyncHandler(userController.getAll)
);
userRouter.get(
	"/:id",
	paramsValidation(idSchema),
	asyncHandler(userController.getOne)
);
userRouter.delete("/:id", asyncHandler(userController.deleteOne));
userRouter.delete("/", asyncHandler(userController.deleteAll));

export default userRouter;
