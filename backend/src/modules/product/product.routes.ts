import { Router } from "express";
import { asyncHandler } from "../../shared/middlewares";
import productController from "./product.controller";

const productRouter: Router = Router();

productRouter.get("/", asyncHandler(productController.getAll));
productRouter.get("/:id", asyncHandler(productController.getOne));
productRouter.post("/", asyncHandler(productController.createNew));
productRouter.patch("/:id", asyncHandler(productController.updateQuantity));
productRouter.delete("/:id", asyncHandler(productController.deleteOne));
productRouter.delete("/", asyncHandler(productController.deleteAll));

export default productRouter;
