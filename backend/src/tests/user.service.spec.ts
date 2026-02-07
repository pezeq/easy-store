import { jest } from "@jest/globals";
import type { ReqUser } from "@modules/auth/auth.types.js";
import type { UserDTO } from "@modules/user/user.types.js";
import { ForbiddenError } from "@shared/errors/appErrors.js";
import type { Pagination } from "@shared/types/custom.types.js";
import { UserRole } from "@shared/types/custom.types.js";

const findAllUsersMock: jest.Mock<
	(
		limit: number,
		offset: number
	) => Promise<{ users: UserDTO[]; count: string | number | bigint }>
> = jest.fn();
const findUserByIdMock: jest.Mock<(id: number) => Promise<UserDTO>> = jest.fn();
const deleteUserByIdMock: jest.Mock<(id: number) => Promise<void>> = jest.fn();
const deleteAllUsersMock: jest.Mock<() => Promise<void>> = jest.fn();
const getUserRoleByIdMock: jest.Mock<
	(id: number) => Promise<{ role: UserRole }>
> = jest.fn();

jest.unstable_mockModule("@modules/user/user.repository.js", () => ({
	findUserById: findUserByIdMock,
	findAllUsers: findAllUsersMock,
	deleteUserById: deleteUserByIdMock,
	deleteAllUsers: deleteAllUsersMock,
	getUserRoleById: getUserRoleByIdMock,
}));

const paginationFormatterMock: jest.Mock<
	<T>(
		data: Array<T>,
		count: string | number | bigint,
		limit: number,
		offset: number
	) => Pagination<T>
> = jest.fn();

jest.unstable_mockModule("@shared/utils/paginationFormatter.js", () => ({
	paginationFormatter: paginationFormatterMock,
}));

const {
	getAll,
	getOne,
	deleteOne,
	deleteAll,
}: {
	getAll: (
		user: ReqUser,
		limit: number,
		offset: number
	) => Promise<Pagination<UserDTO>>;
	getOne: (user: ReqUser, id: number) => Promise<UserDTO>;
	deleteOne: (user: ReqUser, id: number) => Promise<void>;
	deleteAll: () => Promise<void>;
} = await import("@modules/user/user.service.js");

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

	const mockUser = mockUsers[0] as UserDTO;

	const mockReqUser: ReqUser[] = [
		{
			id: 3,
			username: "admin",
			name: "Admin",
			role: UserRole.ADMIN,
		},
		{
			id: 4,
			username: "seller",
			name: "Seller",
			role: UserRole.SELLER,
		},
		{
			id: 5,
			username: "customer",
			name: "Customer",
			role: UserRole.CUSTOMER,
		},
		{
			id: 1,
			username: "johndoe",
			name: "John Doe",
			role: UserRole.CUSTOMER,
		},
	];

	const mockPagination = {
		data: mockUsers,
		meta: {
			page: 1,
			pageSize: 20,
			totalItems: 2,
			totalPages: 1,
		},
	};

	const limit = 20;
	const offset = 0;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return a paginated user list when called by an admin", async () => {
			findAllUsersMock.mockResolvedValue({ users: mockUsers, count: 2 });
			paginationFormatterMock.mockReturnValue(mockPagination);

			const result = await getAll(
				mockReqUser[0] as ReqUser,
				limit,
				offset
			);

			expect(findAllUsersMock).toHaveBeenCalledWith(limit, offset);
			expect(paginationFormatterMock).toHaveBeenCalledWith(
				mockUsers,
				2,
				limit,
				offset
			);
			expect(result).toEqual(mockPagination);
		});

		it("should return a paginated user list when called by a seller", async () => {
			findAllUsersMock.mockResolvedValue({ users: mockUsers, count: 2 });
			paginationFormatterMock.mockReturnValue(mockPagination);

			const result = await getAll(
				mockReqUser[1] as ReqUser,
				limit,
				offset
			);

			expect(findAllUsersMock).toHaveBeenCalledWith(limit, offset);
			expect(paginationFormatterMock).toHaveBeenCalledWith(
				mockUsers,
				2,
				limit,
				offset
			);
			expect(result).toEqual(mockPagination);
		});

		it("should throw ForbiddenError when called by a customer", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.CUSTOMER });

			await expect(
				getAll(mockReqUser[2] as ReqUser, limit, offset)
			).rejects.toThrow(ForbiddenError);

			expect(findAllUsersMock).not.toHaveBeenCalled();
			expect(paginationFormatterMock).not.toHaveBeenCalled();
		});
	});

	describe("getOne", () => {
		it("should fetch user and return when called by a admin", async () => {
			findUserByIdMock.mockResolvedValue(mockUser);

			const result = await getOne(mockReqUser[0] as ReqUser, mockUser.id);

			expect(findUserByIdMock).toHaveBeenCalled();
			expect(findUserByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual(mockUser);
		});

		it("should fetch user and return when called by a seller", async () => {
			findUserByIdMock.mockResolvedValue(mockUser);

			const result = await getOne(mockReqUser[1] as ReqUser, mockUser.id);

			expect(findUserByIdMock).toHaveBeenCalled();
			expect(findUserByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual(mockUser);
		});

		it("should fetch user and return when called by himself", async () => {
			findUserByIdMock.mockResolvedValue(mockUser);

			const result = await getOne(mockReqUser[3] as ReqUser, mockUser.id);

			expect(findUserByIdMock).toHaveBeenCalled();
			expect(findUserByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(result).toEqual(mockUser);
		});

		it("should throw ForbiddenError when called by another customer", async () => {
			findUserByIdMock.mockResolvedValue(mockUser);

			await expect(
				getOne(mockReqUser[2] as ReqUser, mockUser.id)
			).rejects.toThrow(ForbiddenError);

			expect(findUserByIdMock).not.toHaveBeenCalled();
		});
	});

	describe("deleteOne", () => {
		it("should delete an admin when called by another admin", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.ADMIN });

			await deleteOne(mockReqUser[0] as ReqUser, mockUser.id);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).toHaveBeenCalledWith(mockUser.id);
		});

		it("should delete a seller when called by an admin", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.SELLER });

			await deleteOne(mockReqUser[0] as ReqUser, mockUser.id);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).toHaveBeenCalledWith(mockUser.id);
		});

		it("should delete a customer when called by an admin", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.CUSTOMER });

			await deleteOne(mockReqUser[0] as ReqUser, mockUser.id);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).toHaveBeenCalledWith(mockUser.id);
		});

		it("should NOT delete an admin when called by a seller", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.ADMIN });

			await expect(
				deleteOne(mockReqUser[1] as ReqUser, mockUser.id)
			).rejects.toThrow(ForbiddenError);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).not.toHaveBeenCalled();
		});

		it("should NOT delete a seller when called by a seller", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.SELLER });

			await expect(
				deleteOne(mockReqUser[1] as ReqUser, mockUser.id)
			).rejects.toThrow(ForbiddenError);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).not.toHaveBeenCalled();
		});

		it("should NOT delete a customer when called by a seller", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.CUSTOMER });

			await expect(
				deleteOne(mockReqUser[1] as ReqUser, mockUser.id)
			).rejects.toThrow(ForbiddenError);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).not.toHaveBeenCalled();
		});

		it("should delete a customer when called by an admin", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.ADMIN });

			await deleteOne(mockReqUser[0] as ReqUser, mockUser.id);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).toHaveBeenCalledWith(mockUser.id);
		});

		it("should delete a customer when called by himself", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.CUSTOMER });

			await deleteOne(mockReqUser[3] as ReqUser, mockUser.id);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).toHaveBeenCalledWith(mockUser.id);
		});

		it("should NOT delete a customer when called by another customer", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.CUSTOMER });

			await expect(
				deleteOne(mockReqUser[2] as ReqUser, mockUser.id)
			).rejects.toThrow(ForbiddenError);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).not.toHaveBeenCalledWith();
		});

		it("should NOT delete an admin when called by a customer", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.ADMIN });

			await expect(
				deleteOne(mockReqUser[2] as ReqUser, mockUser.id)
			).rejects.toThrow(ForbiddenError);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).not.toHaveBeenCalledWith();
		});

		it("should NOT delete a seller when called by a customer", async () => {
			getUserRoleByIdMock.mockResolvedValue({ role: UserRole.SELLER });

			await expect(
				deleteOne(mockReqUser[2] as ReqUser, mockUser.id)
			).rejects.toThrow(ForbiddenError);

			expect(getUserRoleByIdMock).toHaveBeenCalledWith(mockUser.id);
			expect(deleteUserByIdMock).not.toHaveBeenCalledWith();
		});
	});

	describe("deleteAll", () => {
		it("should deleteAllUsers", async () => {
			deleteAllUsersMock.mockResolvedValue(undefined);

			await deleteAll();

			expect(deleteAllUsersMock).toHaveBeenCalledTimes(1);
		});
	});
});
