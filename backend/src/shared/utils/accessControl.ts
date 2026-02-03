import type { ReqUser } from "@modules/auth/auth.types.js";
import { UserRole } from "@shared/types/custom.types.js";

export const canList = {
	User: (user: ReqUser) => {
		return user.role === UserRole.ADMIN || user.role === UserRole.SELLER;
	},
};

export const canFetch = {
	User: (user: ReqUser, ownerId: number) => {
		return (
			user.role === UserRole.ADMIN ||
			user.role === UserRole.SELLER ||
			user.id === ownerId
		);
	},
};

export const canUpdate = {
	User: (user: ReqUser, ownerId: number) => {
		return user.role === UserRole.ADMIN || user.id === ownerId;
	},
};

export const canRemove = {
	User: (user: ReqUser, ownerId: number) => {
		return user.role === UserRole.ADMIN || user.id === ownerId;
	},
};

export const canRestore = {
	User: (user: ReqUser) => {
		return user.role === UserRole.ADMIN;
	},
};
