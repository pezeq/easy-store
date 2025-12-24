import type { Request, Response } from "express";
import loginService from "../services/loginService";

const login = async (req: Request, res: Response): Promise<void> => {
	const loggedUser = await loginService.login(req.body);

	if (loggedUser) {
		res.status(200).json(loggedUser);
	} else {
		res.status(400).json({ error: "bad request" });
	}
};

export default {
	login,
};
