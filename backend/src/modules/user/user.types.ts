import type { UserRole } from "../../shared/types/role.types";

export interface UserDTO {
	id: number;
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

export const publicUserCols = [
	"id",
	"name",
	"username",
	"email",
	"phone_number as phoneNumber",
	"created_at as createdAt",
] as const;
