import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { type IUser } from "../models/userModel";
import { SECRET } from "../utils/config";

export interface IAuthUser {
	token: string;
	id: string;
	username: string;
	name: string;
}

const login = async (user: Partial<IUser>): Promise<IAuthUser | undefined> => {
	const { username, password } = user;

	if (!username || !password) return;

	const fetchedUser: IUser | null = await User.findOne({ username });

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
			name: fetchedUser.name,
		};
	}

	return;
};

export default {
	login,
};
