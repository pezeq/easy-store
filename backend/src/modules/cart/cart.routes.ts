import { asyncHandler } from "@shared/middlewares/index.js";
import { Router } from "express";
import cartController from "./cart.controller.js";

const cartRouter: Router = Router();

cartRouter.get("/", asyncHandler(cartController.getAll));
cartRouter.get("/:id", asyncHandler(cartController.getOne));
cartRouter.post("/", asyncHandler(cartController.createNew));
cartRouter.post("/:id", asyncHandler(cartController.addProduct));
cartRouter.patch("/:id", asyncHandler(cartController.updateQuantity));
cartRouter.delete("/:id", asyncHandler(cartController.removeProduct));

export default cartRouter;
