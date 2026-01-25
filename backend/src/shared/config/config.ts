import * as dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT);
export const MONGODB_URL = process.env.MONGODB_URL || "NOT_DEFINED";
export const SALT_ROUND = Number(process.env.SALT_ROUND);
export const SECRET = String(process.env.SECRET);
export const DATABASE_NAME = String(process.env.DATABASE_NAME);
export const DATABASE_HOST = String(process.env.DATABASE_HOST);
export const DATABASE_USER = String(process.env.DATABASE_USER);
export const DATABASE_PW = String(process.env.DATABASE_PW);
export const DATABASE_PORT = Number(process.env.DATABASE_PORT);
export const DATABASE_MAX = Number(process.env.DATABASE_MAX);
