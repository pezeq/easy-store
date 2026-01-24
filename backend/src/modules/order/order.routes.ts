import { asyncHandler } from "@shared/middlewares/index.js";
import { Router } from "express";
import orderController from "./order.controller.js";

const orderRouter: Router = Router();

orderRouter.get("/", asyncHandler(orderController.getAll));
orderRouter.get("/:id", asyncHandler(orderController.getOne));
orderRouter.post("/:cartId", asyncHandler(orderController.convertCartToOrder));
orderRouter.patch("/:id", asyncHandler(orderController.updateOne));

export default orderRouter;
