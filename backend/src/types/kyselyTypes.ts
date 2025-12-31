import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
	users: UsersTable;
}

export interface UsersTable {
	id: Generated<string>;
	name: string;
	username: string;
	email: string;
	password_hash: string;
	phone_number: string;
	role: UserRole;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export enum UserRole {
	CUSTOMER = "customer",
	SELLER = "seller",
	ADMIN = "admin",
}
