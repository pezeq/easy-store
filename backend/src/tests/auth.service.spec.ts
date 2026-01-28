import { jest } from "@jest/globals";
import type {
	AuthenticadedUser,
	UserAuth,
	UserCredentials,
	UserSignUp,
} from "@modules/auth/auth.types.js";
import type { UserDTO } from "@modules/user/user.types.js";
import { SALT_ROUND } from "@shared/config/config.js";
import { AuthError } from "@shared/errors/appErrors.js";
import type * as jwt from "jsonwebtoken";

const fetchUserCredentialsMock: jest.Mock<
	(username: string) => Promise<UserAuth | undefined>
> = jest.fn();

const createNewUserMock: jest.Mock<(user: UserSignUp) => Promise<UserDTO>> =
	jest.fn();

const bcryptCompareMock: jest.Mock<
	(
		data: string | Buffer<ArrayBufferLike>,
		encrypted: string
	) => Promise<boolean>
> = jest.fn();

const bcryptHashMock: jest.Mock<
	(
		data: string | Buffer<ArrayBufferLike>,
		saltOrRounds: string | number
	) => Promise<string>
> = jest.fn();

const jwtSignMock: jest.Mock<
	(
		payload: string | object | Buffer<ArrayBufferLike>,
		secretOrPrivateKey: jwt.Secret | jwt.PrivateKey,
		options?: jwt.SignOptions
	) => string
> = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
	default: {
		compare: bcryptCompareMock,
		hash: bcryptHashMock,
	},
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
	default: {
		sign: jwtSignMock,
	},
}));

jest.unstable_mockModule("@modules/auth/auth.repository.js", () => ({
	fetchUserCredentials: fetchUserCredentialsMock,
	createNewUser: createNewUserMock,
}));

const {
	login,
	signup,
}: {
	login: ({
		username,
		password,
	}: UserCredentials) => Promise<AuthenticadedUser>;
	signup: ({
		username,
		password,
		name,
		email,
		phoneNumber,
	}: UserSignUp) => Promise<AuthenticadedUser>;
} = await import("@modules/auth/auth.service.js");

describe("Auth Service", () => {
	const mockUserAuth = {
		id: 1,
		username: "johndoe",
		name: "John Doe",
		passwordHash: "123456790",
		deletedAt: null,
	};

	const mockAuthenticated = {
		token: "token123",
		user: {
			id: mockUserAuth.id,
			username: mockUserAuth.username,
			name: mockUserAuth.name,
		},
	};

	const mockUser = {
		id: 1,
		name: "John Doe",
		username: "johndoe",
		email: "johndoe@email.com",
		phoneNumber: "1234567890",
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("login", () => {
		it("should login with the right credentials", async () => {
			fetchUserCredentialsMock.mockResolvedValue(mockUserAuth);
			bcryptCompareMock.mockResolvedValue(true);
			jwtSignMock.mockReturnValue(mockAuthenticated.token);

			const result = await login({
				username: "johndoe",
				password: "1234567890",
			});

			expect(fetchUserCredentialsMock).toHaveBeenCalledWith("johndoe");
			expect(bcryptCompareMock).toHaveBeenCalledWith(
				"1234567890",
				mockUserAuth.passwordHash
			);
			expect(jwtSignMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockAuthenticated);
		});

		it("should return undefined with the wrong credentials", async () => {
			fetchUserCredentialsMock.mockResolvedValue(undefined);

			await expect(
				login({
					username: "johndoe",
					password: "0987654321",
				})
			).rejects.toThrow(AuthError);
		});
	});

	describe("signup", () => {
		it("should create a new user", async () => {
			bcryptHashMock.mockResolvedValue(mockUserAuth.passwordHash);
			createNewUserMock.mockResolvedValue(mockUser);

			const result = await signup({
				username: "johdoe",
				password: "1234567890",
				name: "John Doe",
				email: "johndoe@email.com",
				phoneNumber: "1234567890",
			});

			expect(bcryptHashMock).toHaveBeenCalledWith(
				"1234567890",
				SALT_ROUND
			);
			expect(createNewUserMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockAuthenticated);
		});
	});
});
