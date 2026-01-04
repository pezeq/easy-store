import type { UpdateResult } from "kysely";
import {
	deleteAllUsers,
	deleteUserById,
	findAllUsers,
	findUserById,
} from "./user.repository";
import type { UserDTO } from "./user.types";

const getAll = (): Promise<UserDTO[]> => {
	return findAllUsers();
};

const getOne = (id: string): Promise<UserDTO> => {
	return findUserById(id);
};

const deleteOne = (id: string): Promise<UpdateResult> => {
	return deleteUserById(id);
};

const deleteAll = (): Promise<UpdateResult> => {
	return deleteAllUsers();
};

export default {
	getAll,
	getOne,
	deleteOne,
	deleteAll,
};
