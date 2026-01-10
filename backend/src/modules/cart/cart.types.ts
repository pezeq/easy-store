export interface CartDTO {
	id: number;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
	convertedAt: Date | null;
}

export interface CartItemDTO {
	productId: number;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	addedAt: Date;
	removedAt: Date | null;
}

export interface FullCartDTO extends CartDTO {
	cartItems: CartItemDTO[];
}

export const publicCartItemsCols = [
	"product_id as productId",
	"quantity",
	"unit_price as unitPrice",
	"total_price as totalPrice",
	"added_at as addedAt",
	"removed_at as removedAt",
] as const;
