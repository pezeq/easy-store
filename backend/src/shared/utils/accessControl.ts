import type { ReqUser } from "@modules/auth/auth.types.js";
import { UserRole } from "@shared/types/custom.types.js";

export const canList = {
	User: (user: ReqUser) => {
		return user.role === UserRole.ADMIN || user.role === UserRole.SELLER;
	},
};

export const canFetch = {
	User: (user: ReqUser, targetId: number) => {
		return (
			user.role === UserRole.ADMIN ||
			user.role === UserRole.SELLER ||
			user.id === targetId
		);
	},
};

export const canUpdate = {
	User: (user: ReqUser, targetId: number) => {
		return user.role === UserRole.ADMIN || user.id === targetId;
	},
};

export const canRemove = {
	User: (user: ReqUser, targetId: number, targetRole: UserRole) => {
		if (user.role === UserRole.ADMIN) {
			return true;
		}

		if (targetRole === UserRole.SELLER) {
			return false;
		}

		if (user.id === targetId) {
			return true;
		}

		return false;
	},
};

export const canRestore = {
	User: (user: ReqUser) => {
		return user.role === UserRole.ADMIN;
	},
};
