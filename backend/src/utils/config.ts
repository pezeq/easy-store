import * as dotenv from "dotenv";

dotenv.config();

export const PORT: number = Number(process.env.PORT);
export const MONGODB_URL: string = process.env.MONGODB_URL || "NOT_DEFINED";
export const SALT_ROUND: number = Number(process.env.SALT_ROUND);
export const SECRET: string = String(process.env.SECRET);
