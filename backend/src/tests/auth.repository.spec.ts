import { jest } from "@jest/globals";
import type { ReqUser, UserAuth } from "@modules/auth/auth.types.js";
import { publicUserCols, type UserDTO } from "@modules/user/user.types.js";
import type { InsertUser } from "@shared/types/kysely.types.js";

interface SelectQuery {
	where: jest.MockedFunction<
		(column: string, operator: string, value: unknown) => SelectQuery
	>;
	executeTakeFirst: jest.MockedFunction<
		() => Promise<UserAuth | ReqUser | undefined>
	>;
}

interface SelectBuilder {
	select: jest.MockedFunction<(cols: unknown) => SelectQuery>;
}

const selectQuery: SelectQuery = {
	where: jest.fn(),
	executeTakeFirst: jest.fn(),
};

selectQuery.where.mockReturnValue(selectQuery);

const selectBuilder: SelectBuilder = {
	select: jest
		.fn<(cols: unknown) => SelectQuery>()
		.mockReturnValue(selectQuery),
};

const mockSelectFrom: jest.MockedFunction<(table: string) => SelectBuilder> =
	jest.fn<(table: string) => SelectBuilder>().mockReturnValue(selectBuilder);

interface InsertQuery {
	values: jest.MockedFunction<(data: unknown) => InsertQuery>;
	returning: jest.MockedFunction<(cols: unknown) => InsertQuery>;
	executeTakeFirstOrThrow: jest.MockedFunction<() => Promise<UserDTO>>;
}

const insertQuery: InsertQuery = {
	values: jest.fn(),
	returning: jest.fn(),
	executeTakeFirstOrThrow: jest.fn(),
};

insertQuery.values.mockReturnValue(insertQuery);
insertQuery.returning.mockReturnValue(insertQuery);

const mockInsertInto: jest.MockedFunction<(table: string) => InsertQuery> = jest
	.fn<(table: string) => InsertQuery>()
	.mockReturnValue(insertQuery);

jest.unstable_mockModule("@shared/database/database.js", () => ({
	db: {
		selectFrom: mockSelectFrom,
		updateTable: jest.fn(),
		insertInto: mockInsertInto,
		deleteFrom: jest.fn(),
	},
}));

const {
	createNewUser,
	fetchUserCredentials,
	fetchReqUser,
}: {
	createNewUser: (user: InsertUser) => Promise<UserDTO>;
	fetchUserCredentials: (username: string) => Promise<UserAuth | undefined>;
	fetchReqUser: (id: number) => Promise<ReqUser | undefined>;
} = await import("@modules/auth/auth.repository.js");

describe("Auth Repository", () => {
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

	const newUserMock = {
		username: "johndoe",
		password_hash: "1234567890",
		name: "John Doe",
		email: "johdoe@email.com",
		phone_number: "1234567890",
	};

	const mockUserAuth: UserAuth = {
		id: 1,
		username: "johndoe",
		name: "John Doe",
		passwordHash: "123456790",
		deletedAt: null,
	};

	const mockReqUser: ReqUser = {
		id: 1,
		username: "johndoe",
		name: "John Doe",
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createNewUser", () => {
		it("persists a new user in the database", async () => {
			insertQuery.executeTakeFirstOrThrow.mockResolvedValue(mockUser);

			const result = await createNewUser(newUserMock);

			expect(mockInsertInto).toHaveBeenCalledWith("users");
			expect(insertQuery.values).toHaveBeenCalledWith(newUserMock);
			expect(insertQuery.returning).toHaveBeenCalledWith(publicUserCols);
			expect(insertQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
			expect(result).toEqual(mockUser);
		});
	});

	describe("fetchUserCredentials", () => {
		it("returns user credentials when the username exists", async () => {
			selectQuery.executeTakeFirst.mockResolvedValue(mockUserAuth);

			const result = await fetchUserCredentials(mockUserAuth.username);

			expect(mockSelectFrom).toHaveBeenCalledWith("users");
			expect(selectBuilder.select).toHaveBeenCalledWith([
				"id",
				"username",
				"name",
				"password_hash as passwordHash",
				"deleted_at as deletedAt",
			]);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"username",
				"=",
				mockUserAuth.username
			);
			expect(selectQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockUserAuth);
		});

		it("returns undefined when the username does not exist", async () => {
			selectQuery.executeTakeFirst.mockResolvedValue(undefined);

			const result = await fetchUserCredentials("foobar");

			expect(mockSelectFrom).toHaveBeenCalledWith("users");
			expect(selectBuilder.select).toHaveBeenCalledWith([
				"id",
				"username",
				"name",
				"password_hash as passwordHash",
				"deleted_at as deletedAt",
			]);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"username",
				"=",
				"foobar"
			);
			expect(selectQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
			expect(result).toEqual(undefined);
		});
	});

	describe("fetchReqUser", () => {
		it("returns the authenticated user for request context", async () => {
			selectQuery.executeTakeFirst.mockResolvedValue(mockReqUser);

			const result = await fetchReqUser(mockReqUser.id);

			expect(mockSelectFrom).toHaveBeenCalledWith("users");
			expect(selectBuilder.select).toHaveBeenCalledWith([
				"id",
				"username",
				"name",
			]);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"id",
				"=",
				mockReqUser.id
			);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(selectQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockReqUser);
		});

		it("returns undefined when the username does not exist", async () => {
			selectQuery.executeTakeFirst.mockResolvedValue(undefined);

			const result = await fetchReqUser(mockReqUser.id);

			expect(mockSelectFrom).toHaveBeenCalledWith("users");
			expect(selectBuilder.select).toHaveBeenCalledWith([
				"id",
				"username",
				"name",
			]);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"id",
				"=",
				mockReqUser.id
			);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(selectQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
			expect(result).toEqual(undefined);
		});
	});
});
