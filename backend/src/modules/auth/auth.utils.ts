import { SALT_ROUND, SECRET } from "@shared/config/config.js";
import { AuthError } from "@shared/errors/appErrors.js";
import bcrypt from "bcrypt";
import type { Request } from "express";
import jwt from "jsonwebtoken";

export const generateToken = (id: number, username: string): string => {
	return jwt.sign(
		{
			id,
			username,
		},
		SECRET,
		{ expiresIn: "7d" }
	);
};

export const checkPasswordMatches = async (
	password: string,
	passwordHash: string
): Promise<boolean> => {
	return await bcrypt.compare(password, passwordHash);
};

export const hashPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, SALT_ROUND);
};

export const getReqUser = (req: Request) => {
	if (!req.user) {
		throw new AuthError();
	}

	return req.user;
};
