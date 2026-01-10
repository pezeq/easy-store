import { SALT_ROUND, SECRET } from "@shared/config/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { UserDTO } from "../user/user.types.js";
import { createNewUser, fetchUserCredentials } from "./auth.repository.js";
import type {
	AuthenticadedUser,
	UserCredentials,
	UserSignUp,
} from "./auth.types.js";

const login = async ({
	username,
	password,
}: UserCredentials): Promise<AuthenticadedUser | undefined> => {
	if (!username || !password) return;

	const fetchedUser = await fetchUserCredentials(username);

	if (!fetchedUser?.passwordHash) return;

	const passwordMatches = await bcrypt.compare(
		password as string,
		fetchedUser.passwordHash
	);

	if (passwordMatches) {
		const token = jwt.sign(
			{
				id: fetchedUser.id,
				username: fetchedUser.username,
			},
			SECRET
		);

		return {
			token,
			id: fetchedUser.id,
			username: fetchedUser.username,
			name: fetchedUser.name,
		};
	}

	return;
};

const signup = async ({
	username,
	password,
	name,
	email,
	phoneNumber,
}: UserSignUp): Promise<UserDTO> => {
	const passwordHash = await bcrypt.hash(password as string, SALT_ROUND);

	const signedUser = await createNewUser({
		username,
		password_hash: passwordHash,
		name,
		email,
		phone_number: phoneNumber,
	});

	return signedUser;
};

export default {
	login,
	signup,
};
