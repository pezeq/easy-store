import bcrypt from "bcrypt";
import { insertUser } from "../repositories/userRepository";
import type { NewUser, UserDTO } from "../types/userTypes";
import { SALT_ROUND } from "../utils/config";

const signup = async ({
	username,
	password,
	name,
	email,
	phone_number,
}: NewUser & { password: string }): Promise<UserDTO> => {
	const passwordHash = await bcrypt.hash(password as string, SALT_ROUND);

	const signedUser = await insertUser({
		username,
		password_hash: passwordHash,
		name,
		email,
		phone_number,
	} as NewUser);

	return signedUser;
};

export default {
	signup,
};
