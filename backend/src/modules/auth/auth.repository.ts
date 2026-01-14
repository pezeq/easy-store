import { db } from "@shared/database/database.js";
import type { InsertUser } from "@shared/types/kysely.types.js";
import { publicUserCols, type UserDTO } from "../user/user.types.js";
import type { ReqUser, UserAuth } from "./auth.types.js";

export async function createNewUser(user: InsertUser): Promise<UserDTO> {
	return await db
		.insertInto("users")
		.values(user)
		.returning(publicUserCols)
		.executeTakeFirstOrThrow();
}

export async function fetchUserCredentials(
	username: string
): Promise<UserAuth | undefined> {
	return await db
		.selectFrom("users")
		.select([
			"id",
			"username",
			"name",
			"password_hash as passwordHash",
			"deleted_at as deletedAt",
		])
		.where("username", "=", username)
		.executeTakeFirst();
}

export async function fetchReqUser(id: number): Promise<ReqUser | undefined> {
	return await db
		.selectFrom("users")
		.select(["id", "username", "name"])
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.executeTakeFirst();
}
