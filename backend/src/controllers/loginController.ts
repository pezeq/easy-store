import type { Request, Response } from "express";
import { AuthError } from "../errors/appErrors";
import loginService from "../services/loginService";

const login = async (req: Request, res: Response): Promise<void> => {
	const { username, password } = req.body;
	const loggedUser = await loginService.login(username, password);

	if (loggedUser) {
		res.status(200).json(loggedUser);
	} else {
		throw new AuthError();
	}
};

export default {
	login,
};
