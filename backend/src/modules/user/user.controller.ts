import { getReqUser } from "@modules/auth/auth.utils.js";
import type { Request, Response } from "express";
import * as userService from "./user.service.js";

export const getAll = async (req: Request, res: Response): Promise<void> => {
	const reqUser = getReqUser(req);

	const { limit, offset } = req.validatedQuery;

	const fetchedUsers = await userService.getAll(reqUser, limit, offset);

	res.status(200).json(fetchedUsers);
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
	const reqUser = getReqUser(req);

	const { id: userIdToFetch } = req.validatedParams;

	const fetchedUser = await userService.getOne(reqUser, userIdToFetch);

	res.status(200).json(fetchedUser);
};

export const deleteOne = async (req: Request, res: Response): Promise<void> => {
	const reqUser = getReqUser(req);

	const { id: userIdToDelete } = req.validatedParams;

	await userService.deleteOne(reqUser, userIdToDelete);
	
	res.status(204).end();
};

export const deleteAll = async (
	_req: Request,
	res: Response
): Promise<void> => {
	await userService.deleteAll();
	res.status(204).end();
};
