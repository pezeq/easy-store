import express, { type Application } from "express";
import {
	authHandler,
	errorHandler,
	requestLogger,
	unknownEndpoint,
} from "./middlewares/index";
import authRouter from "./modules/auth/auth.routes";
import productRouter from "./modules/product/product.routes";
import userRouter from "./modules/user/user.routes";

const app: Application = express();

app.use(express.json());
app.use(requestLogger);

app.use("/auth/", authRouter);

app.use(authHandler);

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
