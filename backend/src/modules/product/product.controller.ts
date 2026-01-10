import type { Request, Response } from "express";
import productServices from "./product.service.js";

const getAll = async (_req: Request, res: Response): Promise<void> => {
	const products = await productServices.getAll();
	res.status(200).json(products);
};

const getOne = async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
	const product = await productServices.getOne(id);
	res.status(200).json(product);
};

const createNew = async (req: Request, res: Response): Promise<void> => {
	const { name, sku, description, price, stockQuantity, brandId } = req.body;

	const newProduct = await productServices.createNew({
		name,
		sku,
		description,
		price,
		stockQuantity,
		brandId,
	});

	res.status(201).json(newProduct);
};

const updateQuantity = async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
	const { quantity } = req.body;

	const updatedProduct = await productServices.updateQuantity(id, quantity);

	res.status(200).json(updatedProduct);
};

const deleteOne = async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
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
	updateQuantity,
	deleteOne,
	deleteAll,
};
