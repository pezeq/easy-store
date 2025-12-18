import express, { type Application } from "express";
import {
	errorHandler,
	requestLogger,
	unknownEndpoint,
} from "./middlewares/index";
import productRouter from "./routes/productRouter";
import connectToMongo from "./utils/db";

const app: Application = express();

connectToMongo();

app.use(express.json());
app.use(requestLogger);

app.use("/api/products", productRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
