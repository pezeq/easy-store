import {
	deleteAllUsers,
	deleteUserById,
	findAllUsers,
	findUserById,
} from "./user.repository.js";
import type { UserDTO } from "./user.types.js";

const getAll = (): Promise<UserDTO[]> => {
	return findAllUsers();
};

const getOne = (id: number): Promise<UserDTO> => {
	return findUserById(id);
};

const deleteOne = async (id: number): Promise<void> => {
	await deleteUserById(id);
};

const deleteAll = async (): Promise<void> => {
	await deleteAllUsers();
};

export default {
	getAll,
	getOne,
	deleteOne,
	deleteAll,
};
