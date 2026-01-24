import type { CartDTO, CartItemDTO } from "@modules/cart/cart.types.js";
import type { FullOrderDTO, OrderDTO, OrderHistoryDTO } from "./order.types.js";

export const formatFullOrder = (
	order: OrderDTO,
	cart: CartDTO,
	cartItems: Array<CartItemDTO>,
	orderStatus: Array<OrderHistoryDTO>
): FullOrderDTO => ({
	userId: cart.userId,
	orderId: order.id,
	cart: {
		id: cart.id,
		cartItems: cartItems.map(({ removedAt, ...product }) => product),
		createdAt: cart.createdAt,
		updatedAt: cart.updatedAt,
	},
	channel: order.channel,
	status: orderStatus,
	subTotal: order.subTotal,
	discount: order.discount,
	shippingCost: order.shippingCost,
	total: order.total,
	createdAt: order.createdAt,
	updatedAt: order.updatedAt,
	completedAt: order.completedAt,
});
