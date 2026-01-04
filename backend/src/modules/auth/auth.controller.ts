import type { Request, Response } from "express";
import { AuthError } from "../../errors/appErrors";
import authService from "./auth.service";

const login = async (req: Request, res: Response): Promise<void> => {
	const { username, password } = req.body;
	const loggedUser = await authService.login(username, password);

	if (loggedUser) {
		res.status(200).json(loggedUser);
	} else {
		throw new AuthError();
	}
};

const signup = async (req: Request, res: Response): Promise<void> => {
	const signedUser = await authService.signup(req.body);
	res.status(201).json(signedUser);
};

export default {
	login,
	signup,
};
