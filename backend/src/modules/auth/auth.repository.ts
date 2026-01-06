import { db } from "../../shared/database/database";
import type { InsertUser } from "../../shared/types/kysely.types";
import { publicUserCols, type UserDTO } from "../user/user.types";
import type { ReqUser, UserAuth } from "./auth.types";

export async function createNewUser(user: InsertUser): Promise<UserDTO> {
	return await db
		.insertInto("users")
		.values(user)
		.returning(publicUserCols)
		.executeTakeFirstOrThrow();
}

export async function fetchUserCredentials(
	username: string
): Promise<UserAuth> {
	return await db
		.selectFrom("users")
		.select(["id", "username", "name", "password_hash as passwordHash"])
		.where("username", "=", username)
		.where("deleted_at", "is", null)
		.executeTakeFirstOrThrow();
}

export async function fetchReqUser(id: number): Promise<ReqUser> {
	return await db
		.selectFrom("users")
		.select(["id", "username", "name"])
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.executeTakeFirstOrThrow();
}
