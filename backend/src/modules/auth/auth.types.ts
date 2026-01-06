export interface UserCredentials {
	username: string;
	password: string;
}

export interface UserAuth {
	id: number;
	username: string;
	name: string;
	passwordHash: string;
}

export interface AuthenticadedUser {
	token: string;
	id: number;
	username: string;
	name: string;
}

export interface UserSignUp {
	username: string;
	password: string;
	name: string;
	email: string;
	phoneNumber: string;
}

export interface ReqUser {
	id: number;
	username: string;
	name: string;
}
