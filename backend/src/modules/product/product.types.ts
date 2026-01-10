export interface ProductDTO {
	id: number;
	name: string;
	sku: string;
	description?: string | null;
	price: number;
	stockQuantity: number;
	brandId: number;
	createdAt: Date;
	updateAt?: Date;
	deletedAt?: Date | null;
}

export interface NewProduct {
	name: string;
	sku: string;
	description: string;
	price: number;
	stockQuantity: number;
	brandId: number;
}

export const publicProductCols = [
	"id",
	"name",
	"sku",
	"description",
	"price",
	"stock_quantity as stockQuantity",
	"brand_id as brandId",
	"created_at as createdAt",
	"updated_at as updatedAt",
	"deleted_at as deletedAt",
] as const;
