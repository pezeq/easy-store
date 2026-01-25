export interface UserCredentials {
	username: string;
	password: string;
}

export interface UserAuth {
	id: number;
	username: string;
	name: string;
	passwordHash: string;
	deletedAt: Date | null;
}

export interface AuthenticadedUser {
	token: string;
	user: {
		id: number;
		username: string;
		name: string | null | undefined;
	};
}

export interface UserSignUp {
	username: string;
	password: string;
	name: string;
	email: string;
	phoneNumber: string | undefined;
}

export interface ReqUser {
	id: number;
	username: string;
	name: string;
}
