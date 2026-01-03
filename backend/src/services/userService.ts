import bcrypt from "bcrypt";
import type { UpdateResult } from "kysely";
import {
	deleteAllUsers,
	deleteUserById,
	findAllUsers,
	findUserById,
	insertUser,
} from "../repositories/userRepository";
import type { NewUser, UserDTO } from "../types/userTypes";
import { SALT_ROUND } from "../utils/config";

const getAll = (): Promise<UserDTO[]> => {
	return findAllUsers();
};

const getOne = (id: string): Promise<UserDTO> => {
	return findUserById(id);
};

const createNew = async (
	user: NewUser & { password: string }
): Promise<UserDTO> => {
	const { name, username, email, phone_number, password } = user;

	const password_hash = await bcrypt.hash(password as string, SALT_ROUND);

	const newUser = await insertUser({
		name,
		username,
		email,
		phone_number,
		password_hash,
	} as NewUser);

	return newUser;
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
	createNew,
	deleteOne,
	deleteAll,
};
