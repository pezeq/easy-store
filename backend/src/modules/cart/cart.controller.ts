import type { Request, Response } from "express";
import { AuthError } from "../../shared/errors/appErrors";
import cartService from "./cart.service";

const getAll = async (_req: Request, res: Response): Promise<void> => {
	const carts = await cartService.getAll();
	res.status(200).json(carts);
};

const getOne = async (req: Request, res: Response): Promise<void> => {
	const cartId = Number(req.params.id);
	const cart = await cartService.getOne(cartId);
	res.status(200).json(cart);
};

const createNew = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user?.id;

	if (!userId) throw new AuthError();

	const { productId, quantity } = req.body;

	const cart = await cartService.createNew(userId, productId, quantity);

	res.status(201).json(cart);
};

const addProduct = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user?.id;

	if (!userId) throw new AuthError();

	const cartId = Number(req.params.id);
	const { productId, quantity } = req.body;

	const cart = await cartService.addProduct(
		userId,
		cartId,
		productId,
		quantity
	);

	res.status(200).json(cart);
};

const updateQuantity = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user?.id;

	if (!userId) throw new AuthError();

	const cartId = Number(req.params.id);
	const { productId, quantity } = req.body;

	const cart = await cartService.updateQuantity(
		userId,
		cartId,
		productId,
		quantity
	);

	cart ? res.status(200).json(cart) : res.status(204).end();
};

const removeProduct = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user?.id;

	if (!userId) throw new AuthError();

	const cartId = Number(req.params.id);
	const { productId } = req.body;

	await cartService.removeProduct(userId, cartId, productId);

	res.status(204).json();
};

export default {
	getAll,
	getOne,
	createNew,
	addProduct,
	updateQuantity,
	removeProduct,
};
