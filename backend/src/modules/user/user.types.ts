import type { UserRole } from "@shared/types/custom.types.js";

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
	"updated_at as updatedAt",
	"deleted_at as deletedAt",
] as const;
