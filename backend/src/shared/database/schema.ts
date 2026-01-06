import type { Generated } from "kysely";
import type { UserRole } from "../types/role.types";

export interface Database {
	users: UsersTable;
	products: ProductsTable;
	brands: BrandsTable;
}

export interface UsersTable {
	id: Generated<number>;
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
	id: Generated<number>;
	name: string;
	sku: string;
	description: string | null;
	price: number;
	stock_quantity: number;
	brand_id: number;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date | null;
}

export interface BrandsTable {
	id: Generated<number>;
	name: string;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date | null;
}
