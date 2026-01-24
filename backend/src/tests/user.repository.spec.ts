import { jest } from "@jest/globals";
import { publicUserCols, type UserDTO } from "@modules/user/user.types.js";
import { NotFoundError } from "@shared/errors/appErrors.js";
import { UserRole } from "@shared/types/custom.types.js";

interface SelectQuery {
	where: jest.MockedFunction<
		(column: string, operator: string, value: unknown) => SelectQuery
	>;
	executeTakeFirstOrThrow: jest.MockedFunction<() => Promise<UserDTO>>;
	execute: jest.MockedFunction<() => Promise<UserDTO[]>>;
}

interface SelectBuilder {
	select: jest.MockedFunction<(cols: unknown) => SelectQuery>;
}

const selectQuery: SelectQuery = {
	where: jest.fn(),
	executeTakeFirstOrThrow: jest.fn(),
	execute: jest.fn(),
};

selectQuery.where.mockReturnValue(selectQuery);

const selectBuilder: SelectBuilder = {
	select: jest
		.fn<(cols: unknown) => SelectQuery>()
		.mockReturnValue(selectQuery),
};

const mockSelectFrom: jest.MockedFunction<(table: string) => SelectBuilder> =
	jest.fn<(table: string) => SelectBuilder>().mockReturnValue(selectBuilder);

interface UpdateQuery {
	where: jest.MockedFunction<
		(column: string, operator: string, value: unknown) => UpdateQuery
	>;
	set: jest.MockedFunction<(column: string, value: unknown) => UpdateQuery>;
	executeTakeFirst: jest.MockedFunction<() => Promise<unknown>>;
}

const updateQuery: UpdateQuery = {
	where: jest.fn(),
	set: jest.fn(),
	executeTakeFirst: jest.fn(),
};

updateQuery.where.mockReturnValue(updateQuery);
updateQuery.set.mockReturnValue(updateQuery);

const mockUpdateTable: jest.MockedFunction<(table: string) => UpdateQuery> =
	jest.fn<(table: string) => UpdateQuery>().mockReturnValue(updateQuery);

jest.unstable_mockModule("@shared/database/database.js", () => ({
	db: {
		selectFrom: mockSelectFrom,
		updateTable: mockUpdateTable,
		insertInto: jest.fn(),
		deleteFrom: jest.fn(),
	},
}));

const {
	findUserById,
	findAllUsers,
	deleteUserById,
	deleteAllUsers,
}: {
	findUserById: (id: number) => Promise<UserDTO>;
	findAllUsers: () => Promise<UserDTO[]>;
	deleteUserById: (id: number) => Promise<void>;
	deleteAllUsers: () => Promise<void>;
} = await import("@modules/user/user.repository.js");

describe("User Repository", () => {
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

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("findUserById", () => {
		it("should build correct query for non-deleted user", async () => {
			selectQuery.executeTakeFirstOrThrow.mockResolvedValue(mockUser);

			const result = await findUserById(1);

			expect(mockSelectFrom).toHaveBeenCalledWith("users");
			expect(selectBuilder.select).toHaveBeenCalledWith(publicUserCols);

			expect(selectQuery.where).toHaveBeenCalledWith("id", "=", 1);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);

			expect(selectQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
			expect(result).toEqual(mockUser);
		});

		it("should throw when user not found", async () => {
			selectQuery.executeTakeFirstOrThrow.mockRejectedValue(
				new NotFoundError()
			);

			await expect(findUserById(999)).rejects.toThrow(NotFoundError);
		});
	});

	describe("findAllUsers", () => {
		it("should query only non-deleted users", async () => {
			selectQuery.execute.mockResolvedValue(mockUsers);

			const result = await findAllUsers();

			expect(mockSelectFrom).toHaveBeenCalledWith("users");
			expect(selectBuilder.select).toHaveBeenCalledWith(publicUserCols);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(selectQuery.execute).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUsers);
		});
	});

	describe("deleteUserById", () => {
		it("should soft delete a specific user", async () => {
			await deleteUserById(2);

			expect(mockUpdateTable).toHaveBeenCalledWith("users");
			expect(updateQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(updateQuery.where).toHaveBeenCalledWith("id", "=", 2);
			expect(updateQuery.set).toHaveBeenCalledWith(
				"deleted_at",
				expect.any(Date)
			);
			expect(updateQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
		});
	});

	describe("deleteAllUsers", () => {
		it("should delete all users that is not admin", async () => {
			await deleteAllUsers();

			expect(mockUpdateTable).toHaveBeenCalledWith("users");
			expect(updateQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(updateQuery.where).toHaveBeenCalledWith(
				"role",
				"!=",
				UserRole.ADMIN
			);
			expect(updateQuery.set).toHaveBeenCalledWith(
				"deleted_at",
				expect.any(Date)
			);
			expect(updateQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
		});
	});
});
