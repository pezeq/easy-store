import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface UsersTable {
	id: Generated<string>;
	name: string | null;
	username: string;
	email: string;
	password_hash: string;
	phone_number: string | null;
	role: UserRole;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
	deleted_at: Date | null;
}

export interface UserDTO {
	id: string;
	name?: string | null;
	username: string;
	email: string;
	passwordHash?: string | null;
	phoneNumber?: string | null;
	role?: UserRole;
	createdAt: Date;
	updatedAt?: Date;
	deletedAt?: Date | null;
}

export interface UserAuth {
	token: string;
	id: string;
	username: string;
	name?: string;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export enum UserRole {
	CUSTOMER = "customer",
	SELLER = "seller",
	ADMIN = "admin",
}
