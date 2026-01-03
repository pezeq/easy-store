import express, { type Application } from "express";
import {
	authHandler,
	errorHandler,
	requestLogger,
	unknownEndpoint,
} from "./middlewares/index";
import loginRouter from "./routes/loginRouter";
import productRouter from "./routes/productRouter";
import signupRouter from "./routes/signupRouter";
import userRouter from "./routes/userRouter";

const app: Application = express();

app.use(express.json());
app.use(requestLogger);

app.use("/api/login", loginRouter);
app.use("/api/signup", signupRouter);

app.use(authHandler);

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
