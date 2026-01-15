import { jest } from "@jest/globals";
import {
	type ProductDTO,
	publicProductCols,
} from "@modules/product/product.types.js";
import {
	DuplicateResourceError,
	NotFoundError,
	ValidationError,
} from "@shared/errors/appErrors.js";
import type { InsertProduct } from "@shared/types/kysely.types.js";

interface SelectQuery {
	where: jest.MockedFunction<
		(column: string, operator: string, value: unknown) => SelectQuery
	>;
	executeTakeFirstOrThrow: jest.MockedFunction<
		() => Promise<ProductDTO | { stockQuantity: number; unitPrice: number }>
	>;
	execute: jest.MockedFunction<() => Promise<ProductDTO[] | undefined>>;
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
	returning: jest.MockedFunction<(cols: unknown) => UpdateQuery>;
	executeTakeFirst: jest.MockedFunction<() => Promise<unknown>>;
}

const updateQuery: UpdateQuery = {
	where: jest.fn(),
	set: jest.fn(),
	returning: jest.fn(),
	executeTakeFirst: jest.fn(),
};

updateQuery.where.mockReturnValue(updateQuery);
updateQuery.set.mockReturnValue(updateQuery);
updateQuery.returning.mockReturnValue(updateQuery);

const mockUpdateTable: jest.MockedFunction<(table: string) => UpdateQuery> =
	jest.fn<(table: string) => UpdateQuery>().mockReturnValue(updateQuery);

interface InsertQuery {
	values: jest.MockedFunction<(data: unknown) => InsertQuery>;
	returning: jest.MockedFunction<(cols: unknown) => InsertQuery>;
	executeTakeFirstOrThrow: jest.MockedFunction<() => Promise<ProductDTO>>;
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
	createNewProduct,
	findProductById,
	findAllProducts,
	deleteProductById,
	deleteAllProducts,
	getProductStockAndPrice,
	updateProductStock,
}: {
	createNewProduct: (newProduct: InsertProduct) => Promise<ProductDTO>;
	findProductById: (id: number) => Promise<ProductDTO>;
	findAllProducts: () => Promise<ProductDTO[]>;
	deleteProductById: (id: number) => Promise<void>;
	deleteAllProducts: () => Promise<void>;
	getProductStockAndPrice: (
		id: number
	) => Promise<{ stockQuantity: number; unitPrice: number }>;
	updateProductStock: (
		id: number,
		quantity: number
	) => Promise<ProductDTO | undefined>;
} = await import("@modules/product/product.repository.js");

describe("Product Repository", () => {
	const mockProducts: ProductDTO[] = [
		{
			id: 1,
			name: "T-Shirt",
			sku: "123",
			description: "White",
			price: 25,
			stockQuantity: 100,
			brandId: 1,
			createdAt: new Date(),
			updateAt: new Date(),
			deletedAt: null,
		},
		{
			id: 2,
			name: "Shoe",
			sku: "321",
			description: "Black",
			price: 100,
			stockQuantity: 25,
			brandId: 2,
			createdAt: new Date(),
			updateAt: new Date(),
			deletedAt: null,
		},
	];

	const mockProduct = mockProducts[0] as ProductDTO;

	const mockNewProduct = {
		name: "T-Shirt",
		sku: "123",
		description: "White",
		price: 25,
		stock_quantity: 100,
		brand_id: 1,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createNewProduct", () => {
		it("persists a new product and returns it", async () => {
			insertQuery.executeTakeFirstOrThrow.mockResolvedValue(mockProduct);

			const result = await createNewProduct(mockNewProduct);

			expect(mockInsertInto).toHaveBeenCalledWith("products");
			expect(insertQuery.values).toHaveBeenCalledWith(mockNewProduct);
			expect(insertQuery.returning).toHaveBeenCalledWith(
				publicProductCols
			);
			expect(insertQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
			expect(result).toEqual(mockProduct);
		});

		it("throws ValidationError when required fields are missing", async () => {
			insertQuery.executeTakeFirstOrThrow.mockRejectedValue(
				new ValidationError()
			);

			const { name, ...mockNewProductWithoutName } = mockNewProduct;

			await expect(
				createNewProduct(mockNewProductWithoutName as InsertProduct)
			).rejects.toThrow(ValidationError);

			expect(mockInsertInto).toHaveBeenCalledWith("products");
			expect(insertQuery.values).toHaveBeenCalledWith(
				mockNewProductWithoutName
			);
			expect(insertQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
		});

		it("throws DuplicateResourceError when a product with unique constraints already exists", async () => {
			insertQuery.executeTakeFirstOrThrow.mockRejectedValue(
				new DuplicateResourceError()
			);

			await expect(createNewProduct(mockNewProduct)).rejects.toThrow(
				DuplicateResourceError
			);

			expect(mockInsertInto).toHaveBeenCalledWith("products");
			expect(insertQuery.values).toHaveBeenCalledWith(mockNewProduct);
			expect(insertQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
		});
	});

	describe("findProductById", () => {
		it("returns the product matching the given id", async () => {
			selectQuery.executeTakeFirstOrThrow.mockResolvedValue(mockProduct);

			const result = await findProductById(1);

			expect(mockSelectFrom).toHaveBeenCalledWith("products");
			expect(selectBuilder.select).toHaveBeenCalledWith(
				publicProductCols
			);
			expect(selectQuery.where).toHaveBeenCalledWith("id", "=", 1);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(selectQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
			expect(result).toEqual(mockProduct);
		});

		it("throws NotFoundError when no product matches the given id", async () => {
			selectQuery.executeTakeFirstOrThrow.mockRejectedValue(
				new NotFoundError()
			);

			await expect(findProductById(666)).rejects.toThrow(NotFoundError);

			expect(mockSelectFrom).toHaveBeenCalledWith("products");
			expect(selectBuilder.select).toHaveBeenCalledWith(
				publicProductCols
			);
			expect(selectQuery.where).toHaveBeenCalledWith("id", "=", 666);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(selectQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
		});
	});

	describe("findAllProducts", () => {
		it("returns a list of all recorded products", async () => {
			selectQuery.execute.mockResolvedValue(mockProducts);

			const result = await findAllProducts();

			expect(mockSelectFrom).toHaveBeenCalledWith("products");
			expect(selectBuilder.select).toHaveBeenCalledWith(
				publicProductCols
			);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(selectQuery.execute).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockProducts);
		});

		it("returns an empty list when no products are recorded", async () => {
			selectQuery.execute.mockResolvedValue(undefined);

			const result = await findAllProducts();

			expect(mockSelectFrom).toHaveBeenCalledWith("products");
			expect(selectBuilder.select).toHaveBeenCalledWith(
				publicProductCols
			);
			expect(selectQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(selectQuery.execute).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined;
		});
	});

	describe("deleteProductById", () => {
		it("removes the product matching the given id", async () => {
			await deleteProductById(1);

			expect(mockUpdateTable).toHaveBeenCalledWith("products");
			expect(updateQuery.where).toHaveBeenCalledWith("id", "=", 1);
			expect(updateQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(updateQuery.set).toHaveBeenCalledWith(
				"deleted_at",
				expect.any(Date)
			);
			expect(updateQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
		});

		it("returns undefined when no product matches the given id", async () => {
			updateQuery.executeTakeFirst.mockResolvedValue(undefined);

			const result = await deleteProductById(666);

			expect(mockUpdateTable).toHaveBeenCalledWith("products");
			expect(updateQuery.where).toHaveBeenCalledWith("id", "=", 666);
			expect(updateQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(updateQuery.set).toHaveBeenCalledWith(
				"deleted_at",
				expect.any(Date)
			);
			expect(updateQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined;
		});
	});

	describe("deleteAllProducts", () => {
		it("removes all persisted products", async () => {
			await deleteAllProducts();

			expect(mockUpdateTable).toHaveBeenCalledWith("products");
			expect(updateQuery.where).toHaveBeenCalledWith(
				"deleted_at",
				"is",
				null
			);
			expect(updateQuery.set).toHaveBeenCalledWith(
				"deleted_at",
				expect.any(Date)
			);
			expect(updateQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
		});
	});

	describe("getProductStockAndPrice", () => {
		it("returns the stock quantity and price for the given product", async () => {
			const stockAndPrice = {
				stockQuantity: 666,
				unitPrice: 100,
			};

			selectQuery.executeTakeFirstOrThrow.mockResolvedValue(
				stockAndPrice
			);

			const result = await getProductStockAndPrice(1);

			expect(mockSelectFrom).toHaveBeenCalledWith("products");
			expect(selectBuilder.select).toHaveBeenCalledWith([
				"stock_quantity as stockQuantity",
				"price as unitPrice",
			]);
			expect(selectQuery.where).toHaveBeenCalledWith("id", "=", 1);
			expect(selectQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
			expect(result).toEqual(stockAndPrice);
		});

		it("throws NotFoundError when no product matches the given id", async () => {
			selectQuery.executeTakeFirstOrThrow.mockRejectedValue(
				new NotFoundError()
			);

			await expect(getProductStockAndPrice(666)).rejects.toThrow(
				NotFoundError
			);
			expect(mockSelectFrom).toHaveBeenCalledWith("products");
			expect(selectBuilder.select).toHaveBeenCalledWith([
				"stock_quantity as stockQuantity",
				"price as unitPrice",
			]);
			expect(selectQuery.where).toHaveBeenCalledWith("id", "=", 666);
			expect(selectQuery.executeTakeFirstOrThrow).toHaveBeenCalledTimes(
				1
			);
		});
	});

	describe("updateProductStock", () => {
		it("updates the stock quantity and returns the updated product", async () => {
			const productBefore = mockProduct;
			const productAfter = {
				...mockProduct,
				stockQuantity: 666,
			};

			updateQuery.executeTakeFirst.mockResolvedValue(productAfter);

			const result = await updateProductStock(1, 666);

			expect(mockUpdateTable).toHaveBeenCalledWith("products");
			expect(updateQuery.set).toHaveBeenCalledWith({
				stock_quantity: 666,
			});
			expect(updateQuery.where).toHaveBeenCalledWith("id", "=", 1);
			expect(updateQuery.returning).toHaveBeenCalledWith(
				publicProductCols
			);
			expect(updateQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
			expect(result).toEqual(productAfter);
			expect(result?.stockQuantity).toBeGreaterThan(
				productBefore.stockQuantity
			);
		});

		it("returns undefined when no product matches the given id", async () => {
			updateQuery.executeTakeFirst.mockResolvedValue(undefined);

			const result = await updateProductStock(666, 1);

			expect(mockUpdateTable).toHaveBeenCalledWith("products");
			expect(updateQuery.set).toHaveBeenCalledWith({
				stock_quantity: 1,
			});
			expect(updateQuery.where).toHaveBeenCalledWith("id", "=", 666);
			expect(updateQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
			expect(result).toBeUndefined();
		});
	});
});
