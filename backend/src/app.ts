import express, { type Application } from "express";
import { requestLogger } from "./middlewares/index";
import productRouter from "./routes/productRouter";
import connectToMongo from "./util/db";

const app: Application = express();

connectToMongo();

app.use(express.json());
app.use(requestLogger);

app.use("/api/products", productRouter);

export default app;
