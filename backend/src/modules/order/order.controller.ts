import type { Request, Response } from "express";
import orderService from "./order.service.js";

const getAll = async (_req: Request, res: Response): Promise<void> => {
	const orders = await orderService.getAll();
	res.status(200).json(orders);
};

const getOne = async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
	const order = await orderService.getOne(id);
	res.status(200).json(order);
};

const convertCartToOrder = async (
	req: Request,
	res: Response
): Promise<void> => {
	const userId = req.user.id;
	const cartId = Number(req.params.cartId);
	const { discount, shippingCost } = req.body;

	const order = await orderService.cartToOrder(
		userId,
		cartId,
		discount,
		shippingCost
	);

	res.status(201).json(order);
};

const updateOne = async (req: Request, res: Response): Promise<void> => {
	const id = Number(req.params.id);
	const { statusToUpdate } = req.body;

	const order = await orderService.updateStatus(id, statusToUpdate);

	res.status(200).json(order);
};

export default {
	getAll,
	getOne,
	convertCartToOrder,
	updateOne,
};
