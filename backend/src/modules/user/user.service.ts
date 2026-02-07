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
	user: ReqUser,
	limit: number,
	offset: number
): Promise<Pagination<UserDTO>> => {
	if (!canList.User(user)) {
		throw new ForbiddenError();
	}

	const { users, count } = await findAllUsers(limit, offset);

	return paginationFormatter(users, count, limit, offset);
};

export const getOne = async (user: ReqUser, id: number): Promise<UserDTO> => {
	const fetchedUser = await findUserById(id);

	if (!canFetch.User(user, fetchedUser.id)) {
		throw new ForbiddenError();
	}

	return fetchedUser;
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
