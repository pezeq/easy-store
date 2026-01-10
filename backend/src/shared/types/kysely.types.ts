import type { Insertable, Selectable, Updateable } from "kysely";
import type {
	BrandsTable,
	CartItemsTable,
	CartsTable,
	ProductsTable,
	UsersTable,
} from "../database/schema";

export type SelectUser = Selectable<UsersTable>;
export type InsertUser = Insertable<UsersTable>;
export type UpdateUser = Updateable<UsersTable>;

export type SelectProduct = Selectable<ProductsTable>;
export type InsertProduct = Insertable<ProductsTable>;
export type UpdateProduct = Updateable<ProductsTable>;

export type SelectBrand = Selectable<BrandsTable>;
export type InsertBrand = Insertable<BrandsTable>;
export type UpdateBrand = Updateable<BrandsTable>;

export type SelectCart = Selectable<CartsTable>;
export type InsertCart = Insertable<CartsTable>;
export type UpdateCart = Updateable<CartsTable>;

export type SelectCartItem = Selectable<CartItemsTable>;
export type InsertCartItem = Insertable<CartItemsTable>;
export type UpdateCartItem = Updateable<CartItemsTable>;
