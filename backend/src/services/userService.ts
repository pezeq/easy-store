import bcrypt from "bcrypt";
import type { DeleteResult } from "kysely";
import {
	deleteAllUsers,
	deleteUserById,
	findAllUsers,
	findUserById,
	insertUser,
} from "../repositories/userRepository";
import type { NewUser, User } from "../types/kyselyTypes";
import { SALT_ROUND } from "../utils/config";

const getAll = (): Promise<Partial<User>[] | undefined> => {
	return findAllUsers();
};

const getOne = (id: string): Promise<Partial<User> | undefined> => {
	return findUserById(id);
};

const createNew = async (
	user: Partial<User> & { password: string }
): Promise<Partial<User>> => {
	const { name, username, email, phone_number, password } = user;

	const password_hash = await bcrypt.hash(password as string, SALT_ROUND);

	const newUser = await insertUser({
		name,
		username,
		email,
		phone_number,
		password_hash,
	} as NewUser);

	console.log(newUser);

	return newUser;
};

const deleteOne = (id: string): Promise<DeleteResult> => {
	return deleteUserById(id);
};

const deleteAll = (): Promise<DeleteResult> => {
	return deleteAllUsers();
};

export default {
	getAll,
	getOne,
	createNew,
	deleteOne,
	deleteAll,
};
