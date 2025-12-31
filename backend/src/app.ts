import express, { type Application } from "express";
import {
	errorHandler,
	requestLogger,
	tokenExtractor,
	unknownEndpoint,
} from "./middlewares/index";
import loginRouter from "./routes/loginRouter";
import productRouter from "./routes/productRouter";
import userRouter from "./routes/userRouter";

const app: Application = express();

app.use(express.json());
app.use(requestLogger);
app.use(tokenExtractor);

app.use("/api/login", loginRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
