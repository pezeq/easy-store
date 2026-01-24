import type { OrderStatus, SalesChannel } from "@shared/types/custom.types.js";

export interface OrderDTO {
	id: number;
	cartId: number;
	channel: SalesChannel;
	subTotal: number;
	discount: number;
	shippingCost: number;
	total: number;
	createdAt: Date;
	updatedAt: Date;
	completedAt: Date | null;
}

export interface FullOrderDTO {
	userId: number;
	orderId: number;
	cart: {
		id: number;
		cartItems: Array<{
			productId: number;
			quantity: number;
			unitPrice: number;
			totalPrice: number;
			addedAt: Date;
		}>;
		createdAt: Date;
		updatedAt: Date;
	};
	channel: SalesChannel;
	status: Array<{
		oldStatus: OrderStatus;
		newStatus: OrderStatus;
		createdAt: Date;
	}>;
	subTotal: number;
	discount: number;
	shippingCost: number;
	total: number;
	createdAt: Date;
	updatedAt: Date;
	completedAt: Date | null;
}

export interface OrderHistoryDTO {
	oldStatus: OrderStatus;
	newStatus: OrderStatus;
	createdAt: Date;
}

export const publicOrderCols = [
	"id",
	"cart_id as cartId",
	"channel",
	"sub_total as subTotal",
	"discount",
	"shipping_cost as shippingCost",
	"total",
	"created_at as createdAt",
	"updated_at as updatedAt",
	"completed_at as completedAt",
] as const;

export const publicOrderHistoryCols = [
	"old_status as oldStatus",
	"new_status as newStatus",
	"created_at as createdAt",
] as const;
