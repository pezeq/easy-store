import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fetchUserAuth } from "../repositories/userRepository";
import type { UserAuth } from "../types/userTypes";
import { SECRET } from "../utils/config";

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

export default {
	login,
};
