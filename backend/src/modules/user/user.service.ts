import { ForbiddenError } from "@shared/errors/appErrors.js";
import { type Pagination, UserRole } from "@shared/types/custom.types.js";
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
	userId: number,
	limit: number,
	offset: number
): Promise<Pagination<UserDTO>> => {
	const { role } = await getUserRoleById(userId);

	if (role === UserRole.CUSTOMER) {
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
