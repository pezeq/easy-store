import { db } from "../../shared/database/database";
import { UserRole } from "../../shared/types/role.types";
import { publicUserCols, type UserDTO } from "./user.types";

export async function findUserById(id: number): Promise<UserDTO> {
	return await db
		.selectFrom("users")
		.select(publicUserCols)
		.where("id", "=", id)
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
