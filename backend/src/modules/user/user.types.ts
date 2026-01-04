import type { UserRole } from "../../shared/types/role.types";

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
