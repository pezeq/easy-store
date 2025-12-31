import type { DeleteResult } from "kysely";
import { db } from "../database";
import type { NewUser, User } from "../types/kyselyTypes";

const publicUserColumn = [
	"id",
	"name",
	"username",
	"email",
	"phone_number",
	"created_at",
] as const;

export async function insertUser(user: NewUser): Promise<Partial<User>> {
	return await db
		.insertInto("users")
		.values(user)
		.returning(publicUserColumn)
		.executeTakeFirstOrThrow();
}

export async function findUserById(
	id: string
): Promise<Partial<User> | undefined> {
	return await db
		.selectFrom("users")
		.where("id", "=", id)
		.select(publicUserColumn)
		.executeTakeFirstOrThrow();
}

export async function findAllUsers(): Promise<Partial<User>[] | undefined> {
	return await db
		.selectFrom("users") //
		.select(publicUserColumn) //
		.execute();
}

export async function deleteUserById(id: string): Promise<DeleteResult> {
	return await db
		.deleteFrom("users") //
		.where("id", "=", id) //
		.executeTakeFirst();
}

export async function deleteAllUsers(): Promise<DeleteResult> {
	return await db
		.deleteFrom("users") //
		.executeTakeFirst();
}
