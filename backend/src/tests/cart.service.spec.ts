import { jest } from "@jest/globals";
import type {
	CartDTO,
	CartItemDTO,
	FullCartDTO,
} from "@modules/cart/cart.types.js";
import type { ProductDTO } from "@modules/product/product.types.js";
import {
	AuthError,
	NotFoundError,
	ValidationError,
} from "@shared/errors/appErrors.js";
import type { UpdateResult } from "kysely";

const findAllCartsMock: jest.Mock<() => Promise<CartDTO[]>> = jest.fn();

const findOneCartMock: jest.Mock<(id: number) => Promise<CartDTO>> = jest.fn();

const findCartItemsMock: jest.Mock<(id: number) => Promise<CartItemDTO[]>> =
	jest.fn();

const findOpenCartMock: jest.Mock<
	(id: number) => Promise<{ id: number } | undefined>
> = jest.fn();

const getCartOwnerIdMock: jest.Mock<
	(id: number) => Promise<{ ownerId: number }>
> = jest.fn();

const getCartProductsMock: jest.Mock<
	(id: number) => Promise<Array<{ id: number }> | undefined>
> = jest.fn();

const getProductQuantityInCartMock: jest.Mock<
	(cartId: number, productId: number) => Promise<{ quantityInCart: number }>
> = jest.fn();

const createNewCartMock: jest.Mock<
	(userId: number) => Promise<{ id: number }>
> = jest.fn();

const addProductToCartMock: jest.Mock<
	(
		cartId: number,
		productId: number,
		quantity: number,
		unitPrice: number,
		totalPrice: number
	) => Promise<CartItemDTO>
> = jest.fn();

const addProuctQuantityInCartMock: jest.Mock<
	(
		cartId: number,
		productId: number,
		quantity: number
	) => Promise<CartItemDTO>
> = jest.fn();

const updateProuctQuantityInCartMock: jest.Mock<
	(
		cartId: number,
		productId: number,
		quantity: number
	) => Promise<CartItemDTO>
> = jest.fn();

const removeProductFromCartMock: jest.Mock<
	(cartId: number, productId: number) => Promise<UpdateResult>
> = jest.fn();

jest.unstable_mockModule("@modules/cart/cart.repository.js", () => ({
	findAllCarts: findAllCartsMock,
	findOneCart: findOneCartMock,
	findCartItems: findCartItemsMock,
	findOpenCart: findOpenCartMock,
	getCartOwnerId: getCartOwnerIdMock,
	getCartProducts: getCartProductsMock,
	getProductQuantityInCart: getProductQuantityInCartMock,
	createNewCart: createNewCartMock,
	addProductToCart: addProductToCartMock,
	addProuctQuantityInCart: addProuctQuantityInCartMock,
	updateProuctQuantityInCart: updateProuctQuantityInCartMock,
	removeProductFromCart: removeProductFromCartMock,
}));

const getProductPriceMock: jest.Mock<
	(id: number) => Promise<{ price: number }>
> = jest.fn();

const getProductStockMock: jest.Mock<
	(id: number) => Promise<{ stockQuantity: number }>
> = jest.fn();

const updateProductStockMock: jest.Mock<
	(id: number, quantity: number) => Promise<ProductDTO | undefined>
> = jest.fn();

jest.unstable_mockModule("@modules/product/product.repository.js", () => ({
	getProductPrice: getProductPriceMock,
	getProductStock: getProductStockMock,
	updateProductStock: updateProductStockMock,
}));

const {
	getAll,
	getOne,
	createNew,
	addProduct,
	updateQuantity,
	removeProduct,
}: {
	getAll: () => Promise<CartDTO[]>;
	getOne: (id: number) => Promise<FullCartDTO>;
	createNew: (
		userId: number,
		productId: number,
		quantity: number
	) => Promise<FullCartDTO>;
	addProduct: (
		userId: number,
		cartId: number,
		productId: number,
		quantity: number
	) => Promise<CartItemDTO>;
	updateQuantity: (
		userId: number,
		cartId: number,
		productId: number,
		quantity: number
	) => Promise<CartItemDTO | undefined>;
	removeProduct: (
		userId: number,
		cartId: number,
		productId: number
	) => Promise<void>;
} = (await import("@modules/cart/cart.service.js")).default;

describe("Cart Service", () => {
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
			addedAt: new Date(),
			removedAt: null,
		},
		{
			productId: 2,
			quantity: 5,
			unitPrice: 10,
			totalPrice: 50,
			addedAt: new Date(),
			removedAt: null,
		},
	];

	const mockCartItem = mockCartItems[0] as CartItemDTO;

	const mockProduct = {
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
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("returns all carts", async () => {
			findAllCartsMock.mockResolvedValue(mockCarts);

			const result = await getAll();

			expect(findAllCartsMock).toHaveBeenCalled();
			expect(result).toEqual(mockCarts);
		});
	});

	describe("getOne", () => {
		it("returns cart with its items when cart exists", async () => {
			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			const result = await getOne(1);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(1);

			expect(findCartItemsMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalledWith(1);

			const cart = mockCart;
			const cartItems = mockCartItems;

			expect(result).toEqual({ ...cart, cartItems });
		});
	});

	describe("createNew", () => {
		it("creates a new cart when customer has no open cart", async () => {
			findOpenCartMock.mockResolvedValue(undefined);
			createNewCartMock.mockResolvedValue({ id: 1 });

			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getProductStockMock.mockResolvedValue({ stockQuantity: 100 });
			getProductPriceMock.mockResolvedValue({ price: 25 });

			await createNew(123, 1, 10);

			expect(findOpenCartMock).toHaveBeenCalled();
			expect(findOpenCartMock).toHaveBeenCalledWith(123);
			expect(findOpenCartMock).resolves.toBeUndefined();

			expect(createNewCartMock).toHaveBeenCalled();
			expect(createNewCartMock).toHaveBeenCalledWith(123);
			expect(createNewCartMock).resolves.toEqual({ id: 1 });
		});

		it("returns existing open cart when customer already has one", async () => {
			findOpenCartMock.mockResolvedValue({ id: 1 });

			await createNew(123, 1, 10);

			expect(findOpenCartMock).toHaveBeenCalled();
			expect(findOpenCartMock).toHaveBeenCalledWith(123);
			expect(findOpenCartMock).resolves.toEqual({ id: 1 });

			expect(createNewCartMock).not.toHaveBeenCalled();
		});

		it("adds product to cart after cart creation", async () => {
			findOpenCartMock.mockResolvedValue(undefined);
			createNewCartMock.mockResolvedValue({ id: 1 });

			await createNew(123, 1, 10);

			expect(getCartProductsMock).toHaveBeenCalled();
			expect(addProductToCartMock).toHaveBeenCalled();
			expect(updateProductStockMock).toHaveBeenCalled();
		});

		it("returns full cart after creation", async () => {
			findOpenCartMock.mockResolvedValue(undefined);
			createNewCartMock.mockResolvedValue({ id: 1 });

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue([mockCartItem]);

			const result = await createNew(123, 1, 10);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalled();
			expect(result).toEqual({ ...mockCart, cartItems: [mockCartItem] });
		});
	});

	describe("addProduct", () => {
		it("adds product to cart when cart belongs to customer", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getProductStockMock.mockResolvedValue({ stockQuantity: 100 });
			getProductPriceMock.mockResolvedValue({ price: 25 });
			getCartProductsMock.mockResolvedValue(undefined);
			addProductToCartMock.mockResolvedValue(mockCartItem);
			updateProductStockMock.mockResolvedValue({
				...mockProduct,
				stockQuantity: 90,
			});

			const result = await addProduct(123, 1, 1, 10);

			expect(getCartOwnerIdMock).toHaveBeenCalled();
			expect(getProductStockMock).toHaveBeenCalled();
			expect(getProductPriceMock).toHaveBeenCalled();
			expect(getCartProductsMock).toHaveBeenCalled();
			expect(addProuctQuantityInCartMock).not.toHaveBeenCalled();

			expect(addProductToCartMock).toHaveBeenCalled();
			expect(addProductToCartMock).toHaveBeenCalledWith(
				1,
				1,
				10,
				25,
				250
			);

			expect(updateProductStockMock).toHaveBeenCalled();

			expect(result).toEqual(mockCartItem);
		});

		it("increments quantity when product already exists in cart", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getProductStockMock.mockResolvedValue({ stockQuantity: 100 });
			getProductPriceMock.mockResolvedValue({ price: 25 });
			getCartProductsMock.mockResolvedValue([{ id: 1 }]);
			addProuctQuantityInCartMock.mockResolvedValue(mockCartItem);
			updateProductStockMock.mockResolvedValue({
				...mockProduct,
				stockQuantity: 90,
			});

			const result = await addProduct(123, 1, 1, 10);

			expect(getCartOwnerIdMock).toHaveBeenCalled();
			expect(getProductStockMock).toHaveBeenCalled();
			expect(getProductPriceMock).toHaveBeenCalled();
			expect(getCartProductsMock).toHaveBeenCalled();

			expect(addProuctQuantityInCartMock).toHaveBeenCalled();
			expect(addProuctQuantityInCartMock).toHaveBeenCalledWith(1, 1, 10);

			expect(addProductToCartMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).toHaveBeenCalled();

			expect(result).toEqual(mockCartItem);
		});

		it("throws AuthError when user does not own the cart", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 666 });

			await expect(addProduct(123, 1, 1, 10)).rejects.toThrow(
				new AuthError("User does not own this cart.")
			);

			expect(getCartOwnerIdMock).toHaveBeenCalledWith(1);
		});

		it("throws ValidationError when requested quantity exceeds stock", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getProductStockMock.mockResolvedValue({ stockQuantity: 5 });
			getProductPriceMock.mockResolvedValue({ price: 25 });

			await expect(addProduct(123, 1, 1, 10)).rejects.toThrow(
				new ValidationError(
					"Product with ID 1, has 5 item(s) in stock."
				)
			);

			expect(getCartOwnerIdMock).toHaveBeenCalledWith(1);
			expect(getProductStockMock).toHaveBeenCalledWith(1);
			expect(getProductPriceMock).toHaveBeenCalledWith(1);
		});

		it("decrements product stock after adding to cart", async () => {
			getProductStockMock.mockResolvedValue({ stockQuantity: 100 });

			await addProduct(123, 1, 1, 10);

			expect(updateProductStockMock).toHaveBeenCalled();
			expect(updateProductStockMock).toHaveBeenCalledWith(1, 90);
			expect(updateProductStockMock).resolves.toEqual({
				...mockProduct,
				stockQuantity: 90,
			});
		});
	});

	describe("updateQuantity", () => {
		it("updates cart item quantity when quantity is valid", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getCartProductsMock.mockResolvedValue([{ id: 1 }]);
			getProductStockMock.mockResolvedValue({ stockQuantity: 90 });
			getProductQuantityInCartMock.mockResolvedValue({
				quantityInCart: 10,
			});
			updateProuctQuantityInCartMock.mockResolvedValue({
				...mockCartItem,
				quantity: 20,
				totalPrice: 500,
			});
			updateProductStockMock.mockResolvedValue({
				...mockProduct,
				stockQuantity: 80,
			});

			const result = await updateQuantity(123, 1, 1, 20);

			expect(getCartOwnerIdMock).toHaveBeenCalled();
			expect(getCartOwnerIdMock).toHaveBeenCalledWith(1);

			expect(getCartProductsMock).toHaveBeenCalled();
			expect(getCartProductsMock).toHaveBeenCalledWith(1);

			expect(getProductStockMock).toHaveBeenCalled();
			expect(getProductStockMock).toHaveBeenCalledWith(1);

			expect(getProductQuantityInCartMock).toHaveBeenCalled();
			expect(getProductQuantityInCartMock).toHaveBeenCalledWith(1, 1);

			expect(updateProuctQuantityInCartMock).toHaveBeenCalled();
			expect(updateProuctQuantityInCartMock).toHaveBeenCalledWith(
				1,
				1,
				20
			);

			expect(updateProductStockMock).toHaveBeenCalled();
			expect(updateProductStockMock).toHaveBeenCalledWith(1, 80);

			expect(result).toEqual({
				...mockCartItem,
				quantity: 20,
				totalPrice: 500,
			});
		});

		it("throws ValidationError when quantity is negative", async () => {
			await expect(updateQuantity(123, 1, 1, -666)).rejects.toThrow(
				new ValidationError("Product quantity can not be negative")
			);

			expect(getCartOwnerIdMock).not.toHaveBeenCalled();
		});

		it("throws AuthError when user does not own the cart", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 666 });

			await expect(updateQuantity(123, 1, 1, 10)).rejects.toThrow(
				new AuthError("User does not own this cart.")
			);

			expect(getCartOwnerIdMock).toHaveBeenCalledWith(1);
		});

		it("throws NotFoundError when product is not in cart", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getCartProductsMock.mockResolvedValue([{ id: 666 }]);

			await expect(updateQuantity(123, 1, 1, 10)).rejects.toThrow(
				new NotFoundError("Product ID 1, was not found in cart ID 1")
			);

			expect(getCartProductsMock).toHaveBeenCalledWith(1);
		});

		it("removes product from cart when quantity is zero", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getCartProductsMock.mockResolvedValue([{ id: 1 }]);

			await updateQuantity(123, 1, 1, 0);

			expect(getProductQuantityInCartMock).toHaveBeenCalled();
			expect(getProductStockMock).toHaveBeenCalled();
			expect(removeProductFromCartMock).toHaveBeenCalled();
			expect(updateProductStockMock).toHaveBeenCalled();
		});

		it("throws ValidationError when quantity exceeds stock", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getCartProductsMock.mockResolvedValue([{ id: 1 }]);
			getProductStockMock.mockResolvedValue({ stockQuantity: 1 });

			await expect(updateQuantity(123, 1, 1, 10)).rejects.toThrow(
				new ValidationError(
					`Product with ID 1, has 1 item(s) in stock.`
				)
			);
		});

		it("adjusts product stock after quantity update", async () => {
			getProductStockMock.mockResolvedValue({ stockQuantity: 90 });
			getProductQuantityInCartMock.mockResolvedValue({
				quantityInCart: 10,
			});
			updateProuctQuantityInCartMock.mockResolvedValue({
				...mockCartItem,
				quantity: 20,
				totalPrice: 500,
			});

			const result = await updateQuantity(123, 1, 1, 20);

			expect(updateProductStockMock).toHaveBeenCalled();
			expect(updateProductStockMock).toHaveBeenCalledWith(1, 80);
			expect(updateProductStockMock).resolves.toEqual({
				...mockProduct,
				stockQuantity: 80,
			});

			expect(result).toEqual({
				...mockCartItem,
				quantity: 20,
				totalPrice: 500,
			});
		});
	});

	describe("removeProduct", () => {
		it("removes product from cart when cart belongs to user", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 123 });
			getProductQuantityInCartMock.mockResolvedValue({
				quantityInCart: 10,
			});
			getProductStockMock.mockResolvedValue({ stockQuantity: 90 });

			await removeProduct(123, 1, 1);

			expect(getCartOwnerIdMock).toHaveBeenCalled();
			expect(getCartOwnerIdMock).toHaveBeenCalledWith(1);

			expect(getProductQuantityInCartMock).toHaveBeenCalled();
			expect(getProductQuantityInCartMock).toHaveBeenCalledWith(1, 1);

			expect(getProductStockMock).toHaveBeenCalled();
			expect(getProductStockMock).toHaveBeenCalledWith(1);

			expect(removeProductFromCartMock).toHaveBeenCalled();
			expect(removeProductFromCartMock).toHaveBeenCalledWith(1, 1);

			expect(updateProductStockMock).toHaveBeenCalled();
			expect(updateProductStockMock).toHaveBeenCalledWith(1, 100);
		});

		it("throws AuthError when user does not own the cart", async () => {
			getCartOwnerIdMock.mockResolvedValue({ ownerId: 666 });

			await expect(removeProduct(123, 1, 1)).rejects.toThrow(
				new AuthError("User does not own this cart.")
			);

			expect(getCartOwnerIdMock).toHaveBeenCalledWith(1);

			expect(getProductQuantityInCartMock).not.toHaveBeenCalled();
			expect(getProductStockMock).not.toHaveBeenCalled();
			expect(removeProductFromCartMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).not.toHaveBeenCalled();
		});
	});
});
