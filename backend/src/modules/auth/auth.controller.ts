import { loginSchema, signupSchema } from "@modules/auth/auth.validation.js";
import type { Request, Response } from "express";
import * as authService from "./auth.service.js";

export const login = async (req: Request, res: Response): Promise<void> => {
	const { username, password } = loginSchema.parse(req.body);

	const sessionUser = await authService.login({ username, password });

	res.status(200).json(sessionUser);
};

export const signup = async (req: Request, res: Response): Promise<void> => {
	const { username, password, name, email, phoneNumber } = signupSchema.parse(
		req.body
	);

	const signedUser = await authService.signup({
		username,
		password,
		name,
		email,
		phoneNumber,
	});

	res.status(201).json(signedUser);
};
