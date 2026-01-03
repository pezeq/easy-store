import type { Request, Response } from "express";
import signupService from "../services/signupService";

const signup = async (req: Request, res: Response): Promise<void> => {
	const signedUser = await signupService.signup(req.body);
	res.status(201).json(signedUser);
};

export default {
	signup,
};
