import type { Generated } from "kysely";
import type {
	OrderStatus,
	SalesChannel,
	UserRole,
} from "../types/custom.types.js";

export interface Database {
	users: UsersTable;
	products: ProductsTable;
	brands: BrandsTable;
	carts: CartsTable;
	cart_items: CartItemsTable;
	orders: OrdersTable;
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

export interface CartsTable {
	id: Generated<number>;
	user_id: number;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	converted_at: Date | null;
}

export interface CartItemsTable {
	id: Generated<number>;
	cart_id: number;
	product_id: number;
	quantity: number;
	unit_price: number;
	total_price: number;
	added_at: Generated<Date>;
	removed_at: Date | null;
}

export interface OrdersTable {
	id: Generated<number>;
	cart_id: number;
	channel: Generated<SalesChannel>;
	status: Generated<OrderStatus>;
	sub_total: number;
	discount: number;
	shipping_cost: number;
	total: number;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	completed_at: Date | null;
}
