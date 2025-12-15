import { Router } from "express";
import productController from "../controllers/productController";

const productRouter: Router = Router();

productRouter.get("/", productController.getAll);
productRouter.get("/:id", productController.getOne);
productRouter.post("/", productController.createNew);
productRouter.delete("/:id", productController.deleteOne);
productRouter.delete("/", productController.deleteAll);

export default productRouter;
