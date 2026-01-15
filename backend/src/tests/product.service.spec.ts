import { jest } from "@jest/globals";
import type { NewProduct, ProductDTO } from "@modules/product/product.types.js";
import {
	DuplicateResourceError,
	NotFoundError,
	ValidationError,
} from "@shared/errors/appErrors.js";
import type { InsertProduct } from "@shared/types/kysely.types.js";

interface ProductService {
	getAll: () => Promise<ProductDTO[]>;
	getOne: (id: number) => Promise<ProductDTO>;
	createNew: ({
		name,
		sku,
		description,
		price,
		stockQuantity,
		brandId,
	}: NewProduct) => Promise<ProductDTO>;
	updateQuantity: (id: number, quantity: number) => Promise<ProductDTO>;
	deleteOne: (id: number) => Promise<void>;
	deleteAll: () => Promise<void>;
}

const createNewProductMock: jest.Mock<
	(newProduct: InsertProduct) => Promise<ProductDTO>
> = jest.fn();
const findProductByIdMock: jest.Mock<(id: number) => Promise<ProductDTO>> =
	jest.fn();
const findAllProductsMock: jest.Mock<() => Promise<ProductDTO[]>> = jest.fn();
const deleteProductByIdMock: jest.Mock<(id: number) => Promise<void>> =
	jest.fn();
const deleteAllProductsMock: jest.Mock<() => Promise<void>> = jest.fn();
const getProductStockAndPriceMock: jest.Mock<
	(id: number) => Promise<{
		stockQuantity: number;
		unitPrice?: number;
	}>
> = jest.fn();
const updateProductStockMock: jest.Mock<
	(id: number, quantity: number) => Promise<ProductDTO | undefined>
> = jest.fn();

jest.unstable_mockModule("@modules/product/product.repository.js", () => ({
	createNewProduct: createNewProductMock,
	findProductById: findProductByIdMock,
	findAllProducts: findAllProductsMock,
	deleteProductById: deleteProductByIdMock,
	deleteAllProducts: deleteAllProductsMock,
	getProductStockAndPrice: getProductStockAndPriceMock,
	updateProductStock: updateProductStockMock,
}));

const productService: ProductService = (
	await import("@modules/product/product.service.js")
).default;

describe("Product Service", () => {
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

	const newProductMock = {
		name: "T-Shirt",
		sku: "123",
		description: "White",
		price: 25,
		stockQuantity: 100,
		brandId: 1,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("returns all products", async () => {
			findAllProductsMock.mockResolvedValue(mockProducts);

			const result = await productService.getAll();

			expect(findAllProductsMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockProducts);
		});

		it("returns an empty list when no products exist", async () => {
			findAllProductsMock.mockResolvedValue([]);

			const result = await productService.getAll();

			expect(findAllProductsMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual([]);
			expect(result).toBeInstanceOf(Array);
			expect(result).toHaveLength(0);
		});
	});

	describe("getOne", () => {
		it("returns the product matching the given id", async () => {
			findProductByIdMock.mockResolvedValue(mockProduct);

			const result = await productService.getOne(mockProduct.id);

			expect(findProductByIdMock).toHaveBeenCalledTimes(1);
			expect(findProductByIdMock).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockProduct);
			expect(result).not.toEqual(mockProducts[1]);
		});

		it("throws NotFoundError when product does not exist", async () => {
			findProductByIdMock.mockRejectedValue(new NotFoundError());

			await expect(productService.getOne(666)).rejects.toThrow(
				NotFoundError
			);
			expect(findProductByIdMock).toHaveBeenCalledTimes(1);
			expect(findProductByIdMock).toHaveBeenCalledWith(666);
		});
	});

	describe("createNew", () => {
		it("creates a product with valid input", async () => {
			createNewProductMock.mockResolvedValue(mockProduct);

			const result = await productService.createNew(newProductMock);

			expect(createNewProductMock).toHaveBeenCalledTimes(1);
			expect(createNewProductMock).toHaveBeenCalledWith({
				name: "T-Shirt",
				sku: "123",
				description: "White",
				price: 25,
				stock_quantity: 100,
				brand_id: 1,
			});
			expect(result).toEqual(mockProduct);
		});

		it("throw ValidationError when required fields are missing", async () => {
			createNewProductMock.mockRejectedValue(new ValidationError());

			await expect(
				productService.createNew({
					sku: "123",
					description: "White",
					price: 25,
					stockQuantity: 100,
					brandId: 1,
				} as NewProduct)
			).rejects.toThrow(ValidationError);

			expect(createNewProductMock).toHaveBeenCalledTimes(1);
			expect(createNewProductMock).toHaveBeenCalledWith({
				sku: "123",
				description: "White",
				price: 25,
				stock_quantity: 100,
				brand_id: 1,
			});
		});

		it("throw DuplicateResourceError when unique constraint are violated", async () => {
			createNewProductMock.mockRejectedValue(
				new DuplicateResourceError()
			);

			await expect(
				productService.createNew(newProductMock)
			).rejects.toThrow(DuplicateResourceError);
		});
	});

	describe("updateQuantity", () => {
		it("updates the product stock quantity", async () => {
			updateProductStockMock.mockResolvedValue({
				...mockProduct,
				stockQuantity: 666,
			});

			const result = await productService.updateQuantity(1, 666);
			expect(updateProductStockMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual({ ...mockProduct, stockQuantity: 666 });
		});

		it("throws ValidationError when quantity is negative", async () => {
			await expect(
				productService.updateQuantity(1, -666)
			).rejects.toThrow(
				new ValidationError("Product quantity cannot be negative")
			);
		});

		it("throws NotFoundError when product does not exist", async () => {
			updateProductStockMock.mockRejectedValue(
				new NotFoundError(`Product with id 666 was not found!`)
			);

			await expect(
				productService.updateQuantity(666, 666)
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("deleteOne", () => {
		it("deletes the product matching the given id", async () => {
			await productService.deleteOne(1);
			expect(deleteProductByIdMock).toHaveBeenCalledTimes(1);
		});
	});

	describe("deleteAll", () => {
		it("deletes all products", async () => {
			await productService.deleteAll();
			expect(deleteAllProductsMock).toHaveBeenCalledTimes(1);
		});
	});
});
