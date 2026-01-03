import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface ProductsTable {
	id: Generated<string>;
	name: string;
	sku: string;
	description: string | null;
	price: number;
	stock_quantity: number;
	size: string | null;
	weight: number | null;
	brand_id: string;
	cost_price: number | null;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date | null;
}

export interface ProductDTO {
	id: string;
	name: string;
	sku: string;
	description?: string | null;
	price: number;
	stockQuantity: number;
	size?: string | null;
	weight?: number | null;
	brandId: string;
	costPrice?: number | null;
	createdAt: Date;
	updateAt?: Date;
	deletedAt?: Date | null;
}

export type Product = Selectable<ProductsTable>;
export type NewProduct = Insertable<ProductsTable>;
export type ProductUpdate = Updateable<ProductsTable>;
