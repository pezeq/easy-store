import { db } from "@shared/database/database.js";
import { UserRole } from "@shared/types/custom.types.js";
import { publicUserCols, type UserDTO } from "./user.types.js";

export async function findUserById(id: number): Promise<UserDTO> {
	return await db
		.selectFrom("users")
		.select(publicUserCols)
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.executeTakeFirstOrThrow();
}

export async function findAllUsers(
	limit: number,
	offset: number
): Promise<{ users: UserDTO[]; count: number }> {
	const [users, { count }] = await Promise.all([
		db
			.selectFrom("users")
			.select(publicUserCols)
			.limit(limit)
			.offset(offset)
			.execute(),

		db
			.selectFrom("users")
			.select(db.fn.countAll().as("count"))
			.executeTakeFirstOrThrow(),
	]);

	return {
		users,
		count: Number(count),
	};
}

export async function getUserRoleById(id: number): Promise<{ role: UserRole }> {
	return await db
		.selectFrom("users")
		.select("role")
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.executeTakeFirstOrThrow();
}

export async function deleteUserById(id: number): Promise<void> {
	await db
		.updateTable("users")
		.where("deleted_at", "is", null)
		.where("id", "=", id)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}

export async function deleteAllUsers(): Promise<void> {
	await db
		.updateTable("users")
		.where("deleted_at", "is", null)
		.where("role", "!=", UserRole.ADMIN)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}
