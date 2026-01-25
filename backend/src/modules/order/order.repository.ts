import { db } from "@shared/database/database.js";
import { OrderStatus } from "@shared/types/custom.types.js";
import type { OrderDTO, OrderHistoryDTO } from "./order.types.js";
import { publicOrderCols, publicOrderHistoryCols } from "./order.types.js";

export async function findAllOrders(): Promise<OrderDTO[]> {
	return await db
		.selectFrom("orders") //
		.select(publicOrderCols) //
		.execute();
}

export async function findOneOrder(id: number): Promise<OrderDTO | undefined> {
	return await db
		.selectFrom("orders")
		.select(publicOrderCols)
		.where("id", "=", id)
		.executeTakeFirst();
}

export async function createOrderFromCart(
	cartId: number,
	subTotal: number,
	discount: number,
	shippingCost: number,
	total: number
): Promise<{ id: number } | undefined> {
	return await db
		.insertInto("orders")
		.values({
			cart_id: cartId,
			sub_total: subTotal,
			discount: discount,
			shipping_cost: shippingCost,
			total,
		})
		.returning(["id"])
		.executeTakeFirst();
}

export async function findAllOrderStatus(
	orderId: number
): Promise<OrderHistoryDTO[]> {
	return await db
		.selectFrom("order_status_history")
		.select(publicOrderHistoryCols)
		.where("order_id", "=", orderId)
		.execute();
}

export async function findLastOrderStatus(
	orderId: number
): Promise<{ current: OrderStatus } | undefined> {
	return await db
		.selectFrom("order_status_history")
		.select(["new_status as current"])
		.where("order_id", "=", orderId)
		.orderBy("created_at", "desc")
		.executeTakeFirst();
}

export async function updateOrderStatus(
	orderId: number,
	oldStatus: OrderStatus,
	newStatus: OrderStatus
): Promise<void> {
	await db
		.insertInto("order_status_history")
		.values({
			order_id: orderId,
			old_status: oldStatus,
			new_status: newStatus,
		})
		.executeTakeFirst();
}

export async function completeOrder(
	orderId: number,
	oldStatus: OrderStatus
): Promise<void> {
	await db
		.insertInto("order_status_history")
		.values({
			order_id: orderId,
			old_status: oldStatus,
			new_status: OrderStatus.COMPLETED,
		})
		.executeTakeFirst();
}
