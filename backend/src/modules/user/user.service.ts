import type { ReqUser } from "@modules/auth/auth.types.js";
import { ForbiddenError } from "@shared/errors/appErrors.js";
import type { Pagination } from "@shared/types/custom.types.js";
import { canFetch, canList } from "@shared/utils/accessControl.js";
import { paginationFormatter } from "@shared/utils/paginationFormatter.js";
import {
	deleteAllUsers,
	deleteUserById,
	findAllUsers,
	findUserById,
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

export const deleteOne = async (id: number): Promise<void> => {
	await deleteUserById(id);
};

export const deleteAll = async (): Promise<void> => {
	await deleteAllUsers();
};
