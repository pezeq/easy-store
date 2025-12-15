import type { Request, Response } from "express";
import productServices from "../services/productServices";

const getAll = async (_req: Request, res: Response): Promise<void> => {
	const products = await productServices.getAll();
	res.status(200).json(products);
};

const getOne = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id as string;
	const product = await productServices.getOne(id);
	res.status(200).json(product);
};

const createNew = async (req: Request, res: Response): Promise<void> => {
	const newProduct = await productServices.createNew(req.body);
	res.status(201).json(newProduct);
};

const deleteOne = async (req: Request, res: Response): Promise<void> => {
	const id = req.params.id as string;
	await productServices.deleteOne(id);
	res.status(204).end();
};

const deleteAll = async (_req: Request, res: Response): Promise<void> => {
	await productServices.deleteAll();
	res.status(204).end();
};

export default {
	getAll,
	getOne,
	createNew,
	deleteOne,
	deleteAll,
};
