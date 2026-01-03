import type { Request, Response } from "express";
import userService from "../services/userService";

const getAll = async (_req: Request, res: Response): Promise<void> => {
	const users = await userService.getAll();
	res.status(200).json(users);
};

const getOne = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id as string;
	const user = await userService.getOne(id);
	res.status(200).json(user);
};

const deleteOne = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id as string;
	await userService.deleteOne(id);
	res.status(204).end();
};

const deleteAll = async (_req: Request, res: Response): Promise<void> => {
	await userService.deleteAll();
	res.status(204).end();
};

export default {
	getAll,
	getOne,
	deleteOne,
	deleteAll,
};
