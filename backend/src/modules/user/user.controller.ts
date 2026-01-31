import { AuthError } from "@shared/errors/appErrors.js";
import type { Request, Response } from "express";
import * as userService from "./user.service.js";

export const getAll = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user?.id;

	if (!userId) {
		throw new AuthError();
	}

	const { limit, offset } = req.validatedQuery;

	const users = await userService.getAll(userId, limit, offset);

	res.status(200).json(users);
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
	const user = await userService.getOne(id);
	res.status(200).json(user);
};

export const deleteOne = async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
	await userService.deleteOne(id);
	res.status(204).end();
};

export const deleteAll = async (
	_req: Request,
	res: Response
): Promise<void> => {
	await userService.deleteAll();
	res.status(204).end();
};
