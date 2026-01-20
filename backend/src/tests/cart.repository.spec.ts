import { jest } from "@jest/globals";
import type { CartDTO, CartItemDTO } from "@modules/cart/cart.types.js";
import {
	publicCartCols,
	publicCartItemsCols,
} from "@modules/cart/cart.types.js";
import { NotFoundError } from "@shared/errors/appErrors.js";
import type { UpdateResult } from "kysely";

interface SelectQuery {
	where: jest.MockedFunction<
		(column: string, operator: string, value: unknown) => SelectQuery
	>;
	orderBy: jest.MockedFunction<
		(expr: string, modifiers?: string | undefined) => SelectQuery
	>;
	executeTakeFirst: jest.MockedFunction<
		() => Promise<{ id: number } | undefined>
	>;
	executeTakeFirstOrThrow: jest.MockedFunction<() => Promise<CartDTO>>;
	execute: jest.MockedFunction<
		() => Promise<CartDTO[] | CartItemDTO[] | undefined>
	>;
}

interface SelectBuilder {
	select: jest.MockedFunction<(cols: unknown) => SelectQuery>;
}

const selectQuery: SelectQuery = {
	where: jest.fn(),
	orderBy: jest.fn(),
	executeTakeFirst: jest.fn(),
	executeTakeFirstOrThrow: jest.fn(),
	execute: jest.fn(),
};

selectQuery.where.mockReturnValue(selectQuery);
selectQuery.orderBy.mockReturnValue(selectQuery);

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
	returning: jest.MockedFunction<(cols: unknown) => UpdateQuery>;
	executeTakeFirst: jest.MockedFunction<() => Promise<unknown>>;
	executeTakeFirstOrThrow: jest.MockedFunction<() => Promise<unknown>>;
}

const updateQuery: UpdateQuery = {
	where: jest.fn(),
	set: jest.fn(),
	returning: jest.fn(),
	executeTakeFirst: jest.fn(),
	executeTakeFirstOrThrow: jest.fn(),
};

updateQuery.where.mockReturnValue(updateQuery);
updateQuery.set.mockReturnValue(updateQuery);
updateQuery.returning.mockReturnValue(updateQuery);

const mockUpdateTable: jest.MockedFunction<(table: string) => UpdateQuery> =
	jest.fn<(table: string) => UpdateQuery>().mockReturnValue(updateQuery);

interface InsertQuery {
	values: jest.MockedFunction<(data: unknown) => InsertQuery>;
	returning: jest.MockedFunction<(cols: unknown) => InsertQuery>;
	executeTakeFirstOrThrow: jest.MockedFunction<() => Promise<CartDTO>>;
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
		updateTable: mockUpdateTable,
		insertInto: mockInsertInto,
		deleteFrom: jest.fn(),
	},
}));

const {
	findAllCarts,
	findOneCart,
	findCartItems,
	findOpenCart,
}: {
	findAllCarts: () => Promise<CartDTO[]>;
	findOneCart: (id: number) => Promise<CartDTO>;
	findCartItems: (id: number) => Promise<CartItemDTO[]>;
	findOpenCart: (id: number) => Promise<{ id: number } | undefined>;
	getCartOwnerId: (id: number) => Promise<{ ownerId: number }>;
	getCartProducts: (id: number) => Promise<Array<{ id: number }> | undefined>;
	getProductQuantityInCart: (
		cartId: number,
		productId: number
	) => Promise<{ quantityInCart: number }>;
	createNewCart: (userId: number) => Promise<{ id: number }>;
	addProductToCart: (
		cartId: number,
		productId: number,
		quantity: number,
		unitPrice: number,
		totalPrice: number
	) => Promise<CartItemDTO>;
	addProuctQuantityInCart: (
		cartId: number,
		productId: number,
		quantity: number
	) => Promise<CartItemDTO>;
	updateProuctQuantityInCart: (
		cartId: number,
		productId: number,
		quantity: number
	) => Promise<CartItemDTO>;
	removeProductFromCart: (
		cartId: number,
		productId: number
	) => Promise<UpdateResult>;
} = await import("@modules/cart/cart.repository.js");

describe("Cart Repository", () => {
	const mockCarts = [
		{
			id: 1,
			userId: 123,
			createdAt: new Date(),
			updatedAt: new Date(),
			convertedAt: null,
		},
		{
			id: 2,
			userId: 456,
			createdAt: new Date(),
			updatedAt: new Date(),
			convertedAt: null,
		},
	];

	const mockCart = mockCarts[0] as CartDTO;

	const mockCartItems = [
		{
			productId: 1,
			quantity: 10,
			unitPrice: 25,
			totalPrice: 250,
			addedAt: new Date(2025),
			removedAt: null,
		},
		{
			productId: 2,
			quantity: 5,
			unitPrice: 10,
			totalPrice: 50,
			addedAt: new Date(2024),
			removedAt: null,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("findAllCarts", () => {
		it("returns a list of all carts", async () => {
			selectQuery.execute.mockResolvedValue(mockCarts);

			const result = await findAllCarts();

			expect(mockSelectFrom).toHaveBeenCalledWith("carts");
			expect(selectBuilder.select).toHaveBeenCalledWith(publicCartCols);
			expect(selectQuery.execute).toHaveBeenCalled();
			expect(result).toEqual(mockCarts);
		});

		it("returns an empty list if there is no registered cart", async () => {
			selectQuery.execute.mockResolvedValue([]);

			const result = await findAllCarts();

			expect(mockSelectFrom).toHaveBeenCalledWith("carts");
			expect(selectBuilder.select).toHaveBeenCalledWith(publicCartCols);
			expect(selectQuery.execute).toHaveBeenCalled();
			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});
	});

	describe("findOneCart", () => {
		it("return cart with matching id", async () => {
			selectQuery.executeTakeFirstOrThrow.mockResolvedValue(mockCart);

			const result = await findOneCart(1);

			expect(mockSelectFrom).toHaveBeenCalledWith("carts");
			expect(selectBuilder.select).toHaveBeenCalledWith(publicCartCols);
			expect(selectQuery.where).toHaveBeenCalledWith("id", "=", 1);
			expect(selectQuery.executeTakeFirstOrThrow).toHaveBeenCalled();
			expect(result).toEqual(mockCart);
		});

		it("throws NotFoundError when no cart matches the given id", async () => {
			selectQuery.executeTakeFirstOrThrow.mockRejectedValue(
				new NotFoundError()
			);

			await expect(findOneCart(666)).rejects.toThrow(NotFoundError);

			expect(mockSelectFrom).toHaveBeenCalledWith("carts");
			expect(selectBuilder.select).toHaveBeenCalledWith(publicCartCols);
			expect(selectQuery.where).toHaveBeenCalledWith("id", "=", 666);
			expect(selectQuery.executeTakeFirstOrThrow).toHaveBeenCalled();
		});
	});

	describe("findCartItems", () => {
		it("returns a list of added items", async () => {
			selectQuery.execute.mockResolvedValue(mockCartItems);

			const result = await findCartItems(1);

			expect(mockSelectFrom).toHaveBeenCalledWith("cart_items");
			expect(selectBuilder.select).toHaveBeenCalledWith(
				publicCartItemsCols
			);
			expect(selectQuery.where).toHaveBeenCalledWith("cart_id", "=", 1);
			expect(selectQuery.orderBy).toHaveBeenCalledWith("addedAt");
			expect(selectQuery.execute).toHaveBeenCalled();
			expect(result).toEqual(mockCartItems);
			expect(result).toHaveLength(2);
			expect(
				new Date(result[0]?.addedAt as Date).getTime()
			).toBeGreaterThan(new Date(result[1]?.addedAt as Date).getTime());
		});

		it("returns an empty list if cart has no product added", async () => {
			selectQuery.execute.mockResolvedValue([]);

			const result = await findCartItems(666);

			expect(mockSelectFrom).toHaveBeenCalledWith("cart_items");
			expect(selectBuilder.select).toHaveBeenCalledWith(
				publicCartItemsCols
			);
			expect(selectQuery.where).toHaveBeenCalledWith("cart_id", "=", 666);
			expect(selectQuery.orderBy).toHaveBeenCalledWith("addedAt");
			expect(selectQuery.execute).toHaveBeenCalled();
			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});
	});

	describe("findOpenCart", () => {
		it("returns an open cart", async () => {
			selectQuery.executeTakeFirst.mockResolvedValue(mockCart);

			const result = await findOpenCart(123);

			expect(mockSelectFrom).toHaveBeenCalledWith("carts");
			expect(selectBuilder.select).toHaveBeenCalledWith(["id"]);
			expect(selectQuery.where).toHaveBeenCalledWith("user_id", "=", 123);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"converted_at",
				"is",
				null
			);
			expect(selectQuery.executeTakeFirst).toHaveBeenCalled();
			expect(result).toEqual(mockCart);
		});
	});
});
