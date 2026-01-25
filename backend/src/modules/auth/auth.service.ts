import { AuthError, ForbiddenError } from "@shared/errors/appErrors.js";
import { createNewUser, fetchUserCredentials } from "./auth.repository.js";
import type {
	AuthenticadedUser,
	UserCredentials,
	UserSignUp,
} from "./auth.types.js";
import {
	checkPasswordMatches,
	generateToken,
	hashPassword,
} from "./auth.utils.js";

export const login = async ({
	username,
	password,
}: UserCredentials): Promise<AuthenticadedUser> => {
	const fetchedUser = await fetchUserCredentials(username);

	if (!fetchedUser) {
		throw new AuthError();
	}

	if (fetchedUser.deletedAt) {
		throw new ForbiddenError(
			"Your account has been deleted and cannot login"
		);
	}

	const passwordMatches = await checkPasswordMatches(
		password,
		fetchedUser.passwordHash
	);

	if (!passwordMatches) {
		throw new AuthError();
	}

	const token = generateToken(fetchedUser.id, fetchedUser.username);

	return {
		token,
		user: {
			id: fetchedUser.id,
			username: fetchedUser.username,
			name: fetchedUser.name,
		},
	};
};

export const signup = async ({
	username,
	password,
	name,
	email,
	phoneNumber,
}: UserSignUp): Promise<AuthenticadedUser> => {
	const passwordHash = await hashPassword(password);

	const newUser = await createNewUser({
		username,
		password: passwordHash,
		name,
		email,
		phoneNumber,
	});

	const token = generateToken(newUser.id, newUser.username);

	return {
		token,
		user: {
			id: newUser.id,
			username: newUser.username,
			name: newUser.name,
		},
	};
};
