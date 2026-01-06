import type { Request, Response } from "express";
import { AuthError } from "../../shared/errors/appErrors";
import authService from "./auth.service";

const login = async (req: Request, res: Response): Promise<void> => {
	const { username, password } = req.body;

	const sessionUser = await authService.login({ username, password });

	if (!sessionUser) throw new AuthError();

	res.status(200).json(sessionUser);
};

const signup = async (req: Request, res: Response): Promise<void> => {
	const { username, password, name, email, phoneNumber } = req.body;

	const signedUser = await authService.signup({
		username,
		password,
		name,
		email,
		phoneNumber,
	});

	res.status(201).json(signedUser);
};

export default {
	login,
	signup,
};
