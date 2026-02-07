import type { ReqUser } from "@modules/auth/auth.types.js";
import { ForbiddenError } from "@shared/errors/appErrors.js";
import type { Pagination } from "@shared/types/custom.types.js";
import { canFetch, canList, canRemove } from "@shared/utils/accessControl.js";
import { paginationFormatter } from "@shared/utils/paginationFormatter.js";
import {
	deleteAllUsers,
	deleteUserById,
	findAllUsers,
	findUserById,
	getUserRoleById,
} from "./user.repository.js";
import type { UserDTO } from "./user.types.js";

export const getAll = async (
	reqUser: ReqUser,
	limit: number,
	offset: number
): Promise<Pagination<UserDTO>> => {
	if (!canList.User(reqUser)) {
		throw new ForbiddenError();
	}

	const { users, count } = await findAllUsers(limit, offset);

	return paginationFormatter(users, count, limit, offset);
};

export const getOne = async (
	reqUser: ReqUser,
	userIdToFetch: number
): Promise<UserDTO> => {
	if (!canFetch.User(reqUser, userIdToFetch)) {
		throw new ForbiddenError();
	}

	return await findUserById(userIdToFetch);
};

export const deleteOne = async (
	reqUser: ReqUser,
	userIdToDelete: number
): Promise<void> => {
	const { role: userRoleToDelete } = await getUserRoleById(userIdToDelete);

	if (!canRemove.User(reqUser, userIdToDelete, userRoleToDelete)) {
		throw new ForbiddenError();
	}

	await deleteUserById(userIdToDelete);
};

export const deleteAll = async (): Promise<void> => {
	await deleteAllUsers();
};
