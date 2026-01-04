import type { Generated } from "kysely";
import type { UserRole } from "../types/role.types";

export interface Database {
	users: UsersTable;
	products: ProductsTable;
	brands: BrandsTable;
}

export interface UsersTable {
	id: Generated<string>;
	name: string;
	username: string;
	email: string;
	password_hash: string;
	phone_number: string | null;
	role: Generated<UserRole>;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date | null;
}

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

export interface BrandsTable {
	id: Generated<string>;
	name: string;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date | null;
}
