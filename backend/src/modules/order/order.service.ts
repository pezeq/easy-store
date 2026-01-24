import {
	checkoutCart,
	findCartItems,
	findOneCart,
} from "@modules/cart/cart.repository.js";
import {
	getProductStock,
	updateProductStock,
} from "@modules/product/product.repository.js";
import {
	AppError,
	AuthError,
	InternalServerError,
	NotFoundError,
	ValidationError,
} from "@shared/errors/appErrors.js";
import { OrderStatus } from "@shared/types/custom.types.js";
import {
	completeOrder,
	createOrderFromCart,
	findAllOrderStatus,
	findAllOrders,
	findLastOrderStatus,
	findOneOrder,
	updateOrderStatus,
} from "./order.repository.js";
import type { FullOrderDTO, OrderDTO } from "./order.types.js";
import { formatFullOrder } from "./order.utils.js";

const getAll = (): Promise<OrderDTO[]> => {
	return findAllOrders();
};

const getOne = async (id: number): Promise<FullOrderDTO> => {
	const order = await findOneOrder(id);
	if (!order) {
		throw new NotFoundError(`Order with ID '${id}' does not exist`);
	}

	const orderCart = await findOneCart(order.cartId);

	const orderItems = await findCartItems(orderCart.id);
	if (!orderItems.length) {
		throw new NotFoundError("Cart is empty");
	}

	const orderStatus = await findAllOrderStatus(order.id);
	if (!orderStatus.length) {
		throw new NotFoundError("Cart has no order status");
	}

	return formatFullOrder(order, orderCart, orderItems, orderStatus);
};

const cartToOrder = async (
	userId: number,
	cartId: number,
	discount: number,
	shippingCost: number
): Promise<FullOrderDTO> => {
	const cart = await findOneCart(cartId);

	if (cart.convertedAt) {
		throw new NotFoundError(`Open cart with ID '${cartId}' does not exist`);
	}

	if (userId !== cart.userId) {
		throw new AuthError("User does not own the cart");
	}

	const cartItems = await findCartItems(cart.id);

	if (!cartItems.length) {
		throw new AppError(
			"Cannot process order because the cart is empty",
			422
		);
	}

	const subTotal = cartItems
		.map((p) => p.totalPrice)
		.reduce((sum, price) => Number(sum) + Number(price), 0);

	const total = subTotal + shippingCost - discount;

	const order = await createOrderFromCart(
		cart.id,
		subTotal,
		discount,
		shippingCost,
		total
	);

	if (!order) {
		throw new InternalServerError(
			"There was an error while processing your order"
		);
	}

	await updateOrderStatus(
		order.id,
		OrderStatus.CREATED,
		OrderStatus.PROCESSING
	);
	await checkoutCart(cart.id);

	return getOne(order.id);
};

const updateStatus = async (
	id: number,
	statusToUpdate: OrderStatus
): Promise<FullOrderDTO> => {
	const order = await findOneOrder(id);

	if (!order) {
		throw new NotFoundError(`Order with ID '${id}' does not exist`);
	}

	const orderStatus = await findLastOrderStatus(order.id);

	if (!orderStatus) {
		throw new ValidationError(`Order with ID '${id}' has no status`);
	}

	const allowedUpdates = {
		[OrderStatus.PROCESSING]: [OrderStatus.PENDING],
		[OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELED],
		[OrderStatus.PAID]: [
			OrderStatus.COMPLETED,
			OrderStatus.CANCELED,
			OrderStatus.REFUNDED,
		],
		[OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
		[OrderStatus.CANCELED]: [OrderStatus.REFUNDED],
	};

	type AllowedType = keyof typeof allowedUpdates;

	const allowedNewStatus =
		allowedUpdates[orderStatus.current as AllowedType] ?? [];

	if (!allowedNewStatus.includes(statusToUpdate)) {
		throw new ValidationError(
			`Update order status from '${orderStatus.current}' to '${statusToUpdate}' is not allowed`
		);
	}

	if (statusToUpdate === OrderStatus.COMPLETED) {
		await completeOrder(order.id, orderStatus.current);
	}

	if (
		statusToUpdate === OrderStatus.CANCELED ||
		statusToUpdate === OrderStatus.REFUNDED
	) {
		const orderItems = await findCartItems(order.cartId);

		for (const item of orderItems) {
			const { productId, quantity } = item;

			const { stockQuantity } = await getProductStock(productId);

			const updatedStock = quantity + stockQuantity;

			await updateProductStock(productId, updatedStock);
		}
	}

	await updateOrderStatus(order.id, orderStatus.current, statusToUpdate);

	return getOne(order.id);
};

export default {
	getAll,
	getOne,
	cartToOrder,
	updateStatus,
};
