import { jest } from "@jest/globals";
import type { UserDTO } from "@modules/user/user.types.js";

interface UserService {
	getAll: () => Promise<UserDTO[]>;
	getOne: (id: number) => Promise<UserDTO>;
	deleteOne: (id: number) => Promise<void>;
	deleteAll: () => Promise<void>;
}

const findAllUsersMock: jest.Mock<() => Promise<UserDTO[]>> = jest.fn();
const findUserByIdMock: jest.Mock<(id: number) => Promise<UserDTO>> = jest.fn();
const deleteUserByIdMock: jest.Mock<(id: number) => Promise<void>> = jest.fn();
const deleteAllUsersMock: jest.Mock<() => Promise<void>> = jest.fn();

jest.unstable_mockModule("@modules/user/user.repository.js", () => ({
	findUserById: findUserByIdMock,
	findAllUsers: findAllUsersMock,
	deleteUserById: deleteUserByIdMock,
	deleteAllUsers: deleteAllUsersMock,
}));

const userService: UserService = (await import("@modules/user/user.service.js"))
	.default;

describe("User Service", () => {
	const mockUsers: UserDTO[] = [
		{
			id: 1,
			name: "John Doe",
			username: "johndoe",
			email: "johndoe@email.com",
			phoneNumber: "1234567890",
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		},
		{
			id: 2,
			name: "Ana Nobody",
			username: "ananobody",
			email: "ananobody@email.com",
			phoneNumber: "0987654321",
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		},
	];

	const mockUser: UserDTO = {
		id: 1,
		name: "John Doe",
		username: "johndoe",
		email: "johndoe@email.com",
		phoneNumber: "1234567890",
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
	}

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should findAllUsers and return them", async () => {
			findAllUsersMock.mockResolvedValue(mockUsers);

			const result = await userService.getAll();

			expect(findAllUsersMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUsers);
		});
	});

	describe("getOne", () => {
		it("should findUserById and return him", async () => {
			findUserByIdMock.mockResolvedValue(mockUser);

			const result = await userService.getOne(mockUser.id);

			expect(findUserByIdMock).toHaveBeenCalledTimes(1);
			expect(findUserByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual(mockUser);
		});
	});

	describe("deleteOne", () => {
		it("should deleteUserById", async () => {
			deleteUserByIdMock.mockResolvedValue(undefined);

			await userService.deleteOne(mockUser.id);

			expect(deleteUserByIdMock).toHaveBeenCalledTimes(1);
			expect(deleteUserByIdMock).toHaveBeenCalledWith(mockUser.id);
		});
	});

	describe("deleteAll", () => {
		it("should deleteAllUsers", async () => {
			deleteAllUsersMock.mockResolvedValue(undefined);

			await userService.deleteAll();

			expect(deleteAllUsersMock).toHaveBeenCalledTimes(1);
		});
	});
});
