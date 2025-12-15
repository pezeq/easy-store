import mongoose from "mongoose";
import { MONGODB_URL } from "./config";

const connectToMongo = async (): Promise<void> => {
	try {
		await mongoose.connect(MONGODB_URL);
		console.log("Connected to MongoDB:", MONGODB_URL);
	} catch (err) {
		console.log("Error connecting to MongoDB:", err);
	}
};

export default connectToMongo;
