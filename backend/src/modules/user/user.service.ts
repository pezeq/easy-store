import type { ReqUser } from "@modules/auth/auth.types.js";
import { ForbiddenError } from "@shared/errors/appErrors.js";
import type { Pagination } from "@shared/types/custom.types.js";
import { canList } from "@shared/utils/accessControl.js";
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

export const getOne = (id: number): Promise<UserDTO> => {
	return findUserById(id);
};

export const deleteOne = async (id: number): Promise<void> => {
	await deleteUserById(id);
};

export const deleteAll = async (): Promise<void> => {
	await deleteAllUsers();
};
