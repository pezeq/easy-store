import authRouter from "@modules/auth/auth.routes.js";
import cartRouter from "@modules/cart/cart.routes.js";
import productRouter from "@modules/product/product.routes.js";
import userRouter from "@modules/user/user.routes.js";
import {
	authHandler,
	errorHandler,
	requestLogger,
	unknownEndpoint,
} from "@shared/middlewares/index.js";
import express, { type Application } from "express";

const app: Application = express();

app.use(express.json());
app.use(requestLogger);

app.use("/auth/", authRouter);

app.use(authHandler);

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/carts", cartRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
