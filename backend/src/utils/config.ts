import * as dotenv from "dotenv";

dotenv.config();

export const PORT: number = Number(process.env.PORT);
export const MONGODB_URL: string = process.env.MONGODB_URL || "NOT_DEFINED";
export const SALT_ROUND: number = Number(process.env.SALT_ROUND);
export const SECRET: string = String(process.env.SECRET);
export const DATABASE_NAME: string = String(process.env.DATABASE_NAME);
export const DATABASE_HOST: string = String(process.env.DATABASE_HOST);
export const DATABASE_USER: string = String(process.env.DATABASE_USER);
export const DATABASE_PW: string = String(process.env.DATABASE_PW);
export const DATABASE_PORT: number = Number(process.env.DATABASE_PORT);
export const DATABASE_MAX: number = Number(process.env.DATABASE_MAX);
