import type { UpdateResult } from "kysely";
import { db } from "../../shared/database/database";
import type { InsertUser } from "../../shared/types/kysely.types";
import { UserRole } from "../../shared/types/role.types";
import type { UserDTO } from "./user.types";

const publicUserCols = [
	"id",
	"name",
	"username",
	"email",
	"phone_number as phoneNumber",
	"created_at as createdAt",
] as const;

export async function insertUser(user: InsertUser): Promise<UserDTO> {
	return await db
		.insertInto("users")
		.values(user)
		.returning(publicUserCols)
		.executeTakeFirstOrThrow();
}

export async function findUserById(id: string): Promise<UserDTO> {
	return await db
		.selectFrom("users")
		.select(publicUserCols)
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.executeTakeFirstOrThrow();
}

export async function fetchUserAuth(username: string): Promise<{
	id: string;
	username: string;
	name: string | null;
	passwordHash: string;
}> {
	return await db
		.selectFrom("users")
		.select(["id", "username", "name", "password_hash as passwordHash"])
		.where("username", "=", username)
		.where("deleted_at", "is", null)
		.executeTakeFirstOrThrow();
}

export async function findAllUsers(): Promise<UserDTO[]> {
	return await db
		.selectFrom("users")
		.select(publicUserCols)
		.where("deleted_at", "is", null)
		.execute();
}

export async function deleteUserById(id: string): Promise<UpdateResult> {
	return await db
		.updateTable("users")
		.where("deleted_at", "is", null)
		.where("id", "=", id)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}

export async function deleteAllUsers(): Promise<UpdateResult> {
	return await db
		.updateTable("users")
		.where("deleted_at", "is", null)
		.where("role", "!=", UserRole.ADMIN)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}
