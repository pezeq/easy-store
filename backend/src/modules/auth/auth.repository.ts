import { db } from "@shared/database/database.js";
import { publicUserCols, type UserDTO } from "../user/user.types.js";
import type { ReqUser, UserAuth, UserSignUp } from "./auth.types.js";

export async function createNewUser({
	username,
	password,
	name,
	email,
	phoneNumber,
}: UserSignUp): Promise<UserDTO> {
	return await db
		.insertInto("users")
		.values({
			username,
			password_hash: password,
			name,
			email,
			phone_number: phoneNumber,
		})
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
