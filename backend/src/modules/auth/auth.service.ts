import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fetchUserAuth, insertUser } from "../../repositories/userRepository";
import { SALT_ROUND, SECRET } from "../../shared/config/config";
import type { NewUser, UserAuth, UserDTO } from "../../types/userTypes";

const login = async (
	username: string,
	password: string
): Promise<UserAuth | undefined> => {
	if (!username || !password) return;

	const fetchedUser: {
		id: string;
		username: string;
		name: string | null;
		passwordHash: string;
	} = await fetchUserAuth(username);

	if (!fetchedUser?.passwordHash) return;

	const passwordMatches = await bcrypt.compare(
		password as string,
		fetchedUser.passwordHash
	);

	if (passwordMatches) {
		const token = jwt.sign(
			{
				id: fetchedUser.id as string,
				username: fetchedUser.username,
			},
			SECRET
		);

		return {
			token,
			id: fetchedUser.id as string,
			username: fetchedUser.username,
			name: fetchedUser.name as string,
		};
	}

	return;
};

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
	login,
	signup,
};
