import { jest } from "@jest/globals";
import type { CartDTO, CartItemDTO } from "@modules/cart/cart.types.js";
import type {
	FullOrderDTO,
	OrderDTO,
	OrderHistoryDTO,
} from "@modules/order/order.types.js";
import type { ProductDTO } from "@modules/product/product.types.js";
import {
	AppError,
	ValidationError,
	AuthError,
	InternalServerError,
	NotFoundError,
} from "@shared/errors/appErrors.js";
import { OrderStatus, SalesChannel } from "@shared/types/custom.types.js";

const findAllOrdersMock: jest.Mock<() => Promise<OrderDTO[]>> = jest.fn();
const findOneOrderMock: jest.Mock<
	(id: number) => Promise<OrderDTO | undefined>
> = jest.fn();
const createOrderFromCartMock: jest.Mock<
	(
		cartId: number,
		subTotal: number,
		discount: number,
		shippingCost: number
	) => Promise<{ id: number } | undefined>
> = jest.fn();
const findAllOrderStatusMock: jest.Mock<
	(orderId: number) => Promise<OrderHistoryDTO[]>
> = jest.fn();
const findLastOrderStatusMock: jest.Mock<
	(orderId: number) => Promise<{ current: OrderStatus } | undefined>
> = jest.fn();
const updateOrderStatusMock: jest.Mock<
	(
		orderId: number,
		oldStatus: OrderStatus,
		newStatus: OrderStatus
	) => Promise<void>
> = jest.fn();
const completeOrderMock: jest.Mock<
	(orderId: number, oldStatus: OrderStatus) => Promise<void>
> = jest.fn();

jest.unstable_mockModule("@modules/order/order.repository.js", () => ({
	findAllOrders: findAllOrdersMock,
	findOneOrder: findOneOrderMock,
	createOrderFromCart: createOrderFromCartMock,
	findAllOrderStatus: findAllOrderStatusMock,
	findLastOrderStatus: findLastOrderStatusMock,
	updateOrderStatus: updateOrderStatusMock,
	completeOrder: completeOrderMock,
}));

const checkoutCartMock: jest.Mock<
	(id: number) => Promise<CartDTO | undefined>
> = jest.fn();
const findCartItemsMock: jest.Mock<(id: number) => Promise<CartItemDTO[]>> =
	jest.fn();
const findOneCartMock: jest.Mock<(id: number) => Promise<CartDTO>> = jest.fn();

jest.unstable_mockModule("@modules/cart/cart.repository.js", () => ({
	checkoutCart: checkoutCartMock,
	findCartItems: findCartItemsMock,
	findOneCart: findOneCartMock,
}));

const formatFullOrderMock: jest.Mock<
	(
		order: OrderDTO,
		cart: CartDTO,
		cartItems: Array<CartItemDTO>,
		orderStatus: Array<OrderHistoryDTO>
	) => FullOrderDTO
> = jest.fn();

jest.unstable_mockModule("@modules/order/order.utils.js", () => ({
	formatFullOrder: formatFullOrderMock,
}));

const getProductStockMock: jest.Mock<
	(id: number) => Promise<{ stockQuantity: number }>
> = jest.fn();
const updateProductStockMock: jest.Mock<
	(id: number, quantity: number) => Promise<ProductDTO | undefined>
> = jest.fn();

jest.unstable_mockModule("@modules/product/product.repository.js", () => ({
	getProductStock: getProductStockMock,
	updateProductStock: updateProductStockMock,
}));

const {
	getAll,
	getOne,
	cartToOrder,
	updateStatus,
}: {
	getAll: () => Promise<OrderDTO[]>;
	getOne: (id: number) => Promise<FullOrderDTO>;
	cartToOrder: (
		userId: number,
		cartId: number,
		discount: number,
		shippingCost: number
	) => Promise<FullOrderDTO>;
	updateStatus: (
		id: number,
		statusToUpdate: OrderStatus
	) => Promise<FullOrderDTO>;
} = (await import("@modules/order/order.service.js")).default;

describe("Order Service", () => {
	const mockFullOrder = {
		userId: 100,
		orderId: 400,
		cart: {
			id: 300,
			cartItems: [
				{
					productId: 200,
					quantity: 1,
					unitPrice: 300,
					totalPrice: 300,
					addedAt: new Date(),
				},
				{
					productId: 201,
					quantity: 3,
					unitPrice: 250,
					totalPrice: 750,
					addedAt: new Date(),
				},
				{
					productId: 203,
					quantity: 2,
					unitPrice: 420,
					totalPrice: 840,
					addedAt: new Date(),
				},
			],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		channel: SalesChannel.ONLINE,
		status: [
			{
				oldStatus: OrderStatus.CREATED,
				newStatus: OrderStatus.PROCESSING,
				createdAt: new Date(),
			},
			{
				oldStatus: OrderStatus.PROCESSING,
				newStatus: OrderStatus.PENDING,
				createdAt: new Date(),
			},
			{
				oldStatus: OrderStatus.PENDING,
				newStatus: OrderStatus.PAID,
				createdAt: new Date(),
			},
		],
		subTotal: 1890,
		discount: 189,
		shippingCost: 39,
		total: 1740,
		createdAt: new Date(),
		updatedAt: new Date(),
		completedAt: new Date(),
	};

	const mockOrder = {
		id: 400,
		cartId: 300,
		channel: SalesChannel.ONLINE,
		subTotal: 1890,
		discount: 189,
		shippingCost: 39,
		total: 1740,
		createdAt: new Date(),
		updatedAt: new Date(),
		completedAt: new Date(),
	};

	const mockCart = {
		id: 300,
		userId: 100,
		createdAt: new Date(),
		updatedAt: new Date(),
		convertedAt: new Date(),
	};

	const mockCartItems = [
		{
			productId: 200,
			quantity: 1,
			unitPrice: 300,
			totalPrice: 300,
			addedAt: new Date(),
			removedAt: null,
		},
		{
			productId: 201,
			quantity: 3,
			unitPrice: 250,
			totalPrice: 750,
			addedAt: new Date(),
			removedAt: null,
		},
		{
			productId: 203,
			quantity: 2,
			unitPrice: 420,
			totalPrice: 840,
			addedAt: new Date(),
			removedAt: null,
		},
	];

	const mockOrderStatus = [
		{
			oldStatus: OrderStatus.CREATED,
			newStatus: OrderStatus.PROCESSING,
			createdAt: new Date(),
		},
		{
			oldStatus: OrderStatus.PROCESSING,
			newStatus: OrderStatus.PENDING,
			createdAt: new Date(),
		},
		{
			oldStatus: OrderStatus.PENDING,
			newStatus: OrderStatus.PAID,
			createdAt: new Date(),
		},
	];

	const mockSingleOrderStatus = [
		{
			oldStatus: OrderStatus.CREATED,
			newStatus: OrderStatus.PROCESSING,
			createdAt: new Date(),
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("return an order list", async () => {
			findAllOrdersMock.mockResolvedValue([mockOrder]);

			const result = await getAll();

			expect(findAllOrdersMock).toHaveBeenCalled();
			expect(result).toEqual([mockOrder]);
			expect(result).toHaveLength(1);
		});

		it("returns an empty list when there is no orders", async () => {
			findAllOrdersMock.mockResolvedValue([]);

			const result = await getAll();

			expect(findAllOrdersMock).toHaveBeenCalled();
			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});
	});

	describe("getOne", () => {
		it("return the order matching the given id", async () => {
			findOneOrderMock.mockResolvedValue(mockOrder);
			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);
			findAllOrderStatusMock.mockResolvedValue(mockOrderStatus);

			formatFullOrderMock.mockReturnValue(mockFullOrder);

			const result = await getOne(mockOrder.id);

			expect(findOneOrderMock).toHaveBeenCalled();
			expect(findOneOrderMock).toHaveBeenCalledWith(mockOrder.id);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockOrder.cartId);

			expect(findCartItemsMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalledWith(mockOrder.cartId);

			expect(findAllOrderStatusMock).toHaveBeenCalled();
			expect(findAllOrderStatusMock).toHaveBeenCalledWith(mockOrder.id);

			expect(formatFullOrderMock).toHaveBeenCalled();
			expect(formatFullOrderMock).toHaveBeenCalledWith(
				mockOrder,
				mockCart,
				mockCartItems,
				mockOrderStatus
			);

			expect(result).toEqual(mockFullOrder);
		});

		it("throws NotFoundError when order does not exist", async () => {
			findOneOrderMock.mockRejectedValue(new NotFoundError());

			await expect(getOne(666)).rejects.toThrow(NotFoundError);

			expect(findOneOrderMock).toHaveBeenCalled();
			expect(findOneOrderMock).toHaveBeenCalledWith(666);

			expect(findOneCartMock).not.toHaveBeenCalled();
			expect(findCartItemsMock).not.toHaveBeenCalled();
			expect(findAllOrderStatusMock).not.toHaveBeenCalled();
			expect(formatFullOrderMock).not.toHaveBeenCalled();
		});

		it("throws NotFoundError when cart does not exist", async () => {
			findOneOrderMock.mockResolvedValue(mockOrder);
			findOneCartMock.mockRejectedValue(new NotFoundError());

			await expect(getOne(mockOrder.id)).rejects.toThrow(NotFoundError);

			expect(findOneOrderMock).toHaveBeenCalled();
			expect(findOneOrderMock).toHaveBeenCalledWith(mockOrder.id);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockOrder.cartId);

			expect(findCartItemsMock).not.toHaveBeenCalled();
			expect(findAllOrderStatusMock).not.toHaveBeenCalled();
			expect(formatFullOrderMock).not.toHaveBeenCalled();
		});

		it("throws NotFoundError when cart is empty", async () => {
			findOneOrderMock.mockResolvedValue(mockOrder);
			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue([]);

			await expect(getOne(mockOrder.id)).rejects.toThrow(
				new NotFoundError("Cart is empty")
			);

			expect(findOneOrderMock).toHaveBeenCalled();
			expect(findOneOrderMock).toHaveBeenCalledWith(mockOrder.id);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockOrder.cartId);

			expect(findCartItemsMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalledWith(mockOrder.cartId);

			expect(findAllOrderStatusMock).not.toHaveBeenCalled();
			expect(formatFullOrderMock).not.toHaveBeenCalled();
		});

		it("throws NotFoundError when order has no status", async () => {
			findOneOrderMock.mockResolvedValue(mockOrder);
			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);
			findAllOrderStatusMock.mockResolvedValue([]);

			await expect(getOne(mockOrder.id)).rejects.toThrow(
				new NotFoundError("Cart has no order status")
			);

			expect(findOneOrderMock).toHaveBeenCalled();
			expect(findOneOrderMock).toHaveBeenCalledWith(mockOrder.id);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockOrder.cartId);

			expect(findCartItemsMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalledWith(mockOrder.cartId);

			expect(findAllOrderStatusMock).toHaveBeenCalled();
			expect(findAllOrderStatusMock).toHaveBeenCalledWith(mockOrder.id);

			expect(formatFullOrderMock).not.toHaveBeenCalled();
		});
	});

	describe("cartToOrder", () => {
		it("creates a new order from an open cart", async () => {
			findOneCartMock.mockResolvedValue({
				...mockCart,
				convertedAt: null,
			});
			findCartItemsMock.mockResolvedValue(mockCartItems);
			createOrderFromCartMock.mockResolvedValue({ id: mockOrder.id });

			findOneOrderMock.mockResolvedValue(mockOrder);
			findAllOrderStatusMock.mockResolvedValue(mockSingleOrderStatus);

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: mockSingleOrderStatus,
			});

			const result = await cartToOrder(
				mockFullOrder.userId,
				mockCart.id,
				mockOrder.discount,
				mockOrder.shippingCost
			);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockCart.id);

			expect(findCartItemsMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalledWith(mockCart.id);

			expect(createOrderFromCartMock).toHaveBeenCalled();
			expect(createOrderFromCartMock).toHaveBeenCalledWith(
				mockCart.id,
				mockOrder.subTotal,
				mockOrder.discount,
				mockOrder.shippingCost
			);

			expect(updateOrderStatusMock).toHaveBeenCalled();
			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.CREATED,
				OrderStatus.PENDING
			);

			expect(checkoutCartMock).toHaveBeenCalled();
			expect(checkoutCartMock).toHaveBeenCalledWith(mockCart.id);

			expect(formatFullOrderMock).toHaveBeenCalled();

			expect(result).toEqual({
				...mockFullOrder,
				status: mockSingleOrderStatus,
			});
		});

		it("throws NotFoundError when cart is already converted", async () => {
			findOneCartMock.mockResolvedValue(mockCart);

			await expect(
				cartToOrder(
					mockFullOrder.userId,
					mockCart.id,
					mockOrder.discount,
					mockOrder.shippingCost
				)
			).rejects.toThrow(NotFoundError);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockCart.id);

			expect(findCartItemsMock).not.toHaveBeenCalled();
			expect(createOrderFromCartMock).not.toHaveBeenCalled();
			expect(updateOrderStatusMock).not.toHaveBeenCalled();
			expect(checkoutCartMock).not.toHaveBeenCalled();
		});

		it("throws AuthError when user does not own cart", async () => {
			findOneCartMock.mockResolvedValue({
				...mockCart,
				convertedAt: null,
				userId: 666,
			});

			await expect(
				cartToOrder(
					mockFullOrder.userId,
					mockCart.id,
					mockOrder.discount,
					mockOrder.shippingCost
				)
			).rejects.toThrow(AuthError);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockCart.id);

			expect(findCartItemsMock).not.toHaveBeenCalled();
			expect(createOrderFromCartMock).not.toHaveBeenCalled();
			expect(updateOrderStatusMock).not.toHaveBeenCalled();
			expect(checkoutCartMock).not.toHaveBeenCalled();
		});

		it("throws AppError when cart has no products", async () => {
			findOneCartMock.mockResolvedValue({
				...mockCart,
				convertedAt: null,
			});
			findCartItemsMock.mockResolvedValue([]);

			await expect(
				cartToOrder(
					mockFullOrder.userId,
					mockCart.id,
					mockOrder.discount,
					mockOrder.shippingCost
				)
			).rejects.toThrow(AppError);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockCart.id);

			expect(findCartItemsMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalledWith(mockCart.id);

			expect(createOrderFromCartMock).not.toHaveBeenCalled();
			expect(updateOrderStatusMock).not.toHaveBeenCalled();
			expect(checkoutCartMock).not.toHaveBeenCalled();
		});

		it("throws InternalServerError when order is not processed", async () => {
			findOneCartMock.mockResolvedValue({
				...mockCart,
				convertedAt: null,
			});
			findCartItemsMock.mockResolvedValue(mockCartItems);
			createOrderFromCartMock.mockResolvedValue(undefined);

			await expect(
				cartToOrder(
					mockFullOrder.userId,
					mockCart.id,
					mockOrder.discount,
					mockOrder.shippingCost
				)
			).rejects.toThrow(InternalServerError);

			expect(findOneCartMock).toHaveBeenCalled();
			expect(findOneCartMock).toHaveBeenCalledWith(mockCart.id);

			expect(findCartItemsMock).toHaveBeenCalled();
			expect(findCartItemsMock).toHaveBeenCalledWith(mockCart.id);

			expect(createOrderFromCartMock).toHaveBeenCalled();
			expect(updateOrderStatusMock).not.toHaveBeenCalled();
			expect(checkoutCartMock).not.toHaveBeenCalled();
		});
	});

	describe("updateStatus", () => {
		it("updates order status from processing to pending", async () => {
			findOneOrderMock.mockResolvedValue({
				...mockOrder,
				completedAt: null,
			});

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.PROCESSING,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.CREATED,
						newStatus: OrderStatus.PROCESSING,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			const result = await updateStatus(
				mockOrder.id,
				OrderStatus.PENDING
			);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(1);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(completeOrderMock).not.toHaveBeenCalled();
			expect(getProductStockMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.PROCESSING,
				OrderStatus.PENDING
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.CREATED,
						newStatus: OrderStatus.PROCESSING,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("updates order status from peding to paid", async () => {
			findOneOrderMock.mockResolvedValue({
				...mockOrder,
				completedAt: null,
			});

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.PENDING,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PENDING,
						newStatus: OrderStatus.PAID,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			const result = await updateStatus(mockOrder.id, OrderStatus.PAID);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(1);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(completeOrderMock).not.toHaveBeenCalled();
			expect(getProductStockMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.PENDING,
				OrderStatus.PAID
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PENDING,
						newStatus: OrderStatus.PAID,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("updates order status from pending to canceled", async () => {
			findOneOrderMock.mockResolvedValue({
				...mockOrder,
				completedAt: null,
			});

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.PENDING,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PENDING,
						newStatus: OrderStatus.CANCELED,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			getProductStockMock
				.mockResolvedValueOnce({
					stockQuantity: 99,
				})
				.mockResolvedValueOnce({
					stockQuantity: 97,
				})
				.mockResolvedValueOnce({
					stockQuantity: 98,
				});

			const result = await updateStatus(
				mockOrder.id,
				OrderStatus.CANCELED
			);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(2);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(getProductStockMock).toHaveBeenCalledTimes(3);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId
			);

			expect(getProductStockMock);

			expect(updateProductStockMock).toHaveBeenCalledTimes(3);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId,
				100
			);

			expect(completeOrderMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.PENDING,
				OrderStatus.CANCELED
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PENDING,
						newStatus: OrderStatus.CANCELED,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("updates order status from paid to completed", async () => {
			findOneOrderMock.mockResolvedValue(mockOrder);

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.PAID,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PAID,
						newStatus: OrderStatus.COMPLETED,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			const result = await updateStatus(
				mockOrder.id,
				OrderStatus.COMPLETED
			);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(1);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(completeOrderMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.PAID
			);

			expect(getProductStockMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.PAID,
				OrderStatus.COMPLETED
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PAID,
						newStatus: OrderStatus.COMPLETED,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("updates order status from paid to canceled", async () => {
			findOneOrderMock.mockResolvedValue({
				...mockOrder,
				completedAt: null,
			});

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.PAID,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PAID,
						newStatus: OrderStatus.CANCELED,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			getProductStockMock
				.mockResolvedValueOnce({
					stockQuantity: 99,
				})
				.mockResolvedValueOnce({
					stockQuantity: 97,
				})
				.mockResolvedValueOnce({
					stockQuantity: 98,
				});

			const result = await updateStatus(
				mockOrder.id,
				OrderStatus.CANCELED
			);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(2);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(getProductStockMock).toHaveBeenCalledTimes(3);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId
			);

			expect(getProductStockMock);

			expect(updateProductStockMock).toHaveBeenCalledTimes(3);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId,
				100
			);

			expect(completeOrderMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.PAID,
				OrderStatus.CANCELED
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PAID,
						newStatus: OrderStatus.CANCELED,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("updates order status from paid to refunded", async () => {
			findOneOrderMock.mockResolvedValue({
				...mockOrder,
				completedAt: null,
			});

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.PAID,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PAID,
						newStatus: OrderStatus.REFUNDED,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			getProductStockMock
				.mockResolvedValueOnce({
					stockQuantity: 99,
				})
				.mockResolvedValueOnce({
					stockQuantity: 97,
				})
				.mockResolvedValueOnce({
					stockQuantity: 98,
				});

			const result = await updateStatus(
				mockOrder.id,
				OrderStatus.REFUNDED
			);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(2);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(getProductStockMock).toHaveBeenCalledTimes(3);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId
			);

			expect(getProductStockMock);

			expect(updateProductStockMock).toHaveBeenCalledTimes(3);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId,
				100
			);

			expect(completeOrderMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.PAID,
				OrderStatus.REFUNDED
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.PAID,
						newStatus: OrderStatus.REFUNDED,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("updates order status from completed to refunded", async () => {
			findOneOrderMock.mockResolvedValue({
				...mockOrder,
				completedAt: null,
			});

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.COMPLETED,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.COMPLETED,
						newStatus: OrderStatus.REFUNDED,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			getProductStockMock
				.mockResolvedValueOnce({
					stockQuantity: 99,
				})
				.mockResolvedValueOnce({
					stockQuantity: 97,
				})
				.mockResolvedValueOnce({
					stockQuantity: 98,
				});

			const result = await updateStatus(
				mockOrder.id,
				OrderStatus.REFUNDED
			);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(2);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(getProductStockMock).toHaveBeenCalledTimes(3);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId
			);

			expect(getProductStockMock);

			expect(updateProductStockMock).toHaveBeenCalledTimes(3);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId,
				100
			);

			expect(completeOrderMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.COMPLETED,
				OrderStatus.REFUNDED
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.COMPLETED,
						newStatus: OrderStatus.REFUNDED,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("updates order status from canceled to refunded", async () => {
			findOneOrderMock.mockResolvedValue({
				...mockOrder,
				completedAt: null,
			});

			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.CANCELED,
			});

			formatFullOrderMock.mockReturnValue({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.CANCELED,
						newStatus: OrderStatus.REFUNDED,
						createdAt: new Date(),
					},
				],
			});

			findOneCartMock.mockResolvedValue(mockCart);
			findCartItemsMock.mockResolvedValue(mockCartItems);

			getProductStockMock
				.mockResolvedValueOnce({
					stockQuantity: 99,
				})
				.mockResolvedValueOnce({
					stockQuantity: 97,
				})
				.mockResolvedValueOnce({
					stockQuantity: 98,
				});

			const result = await updateStatus(
				mockOrder.id,
				OrderStatus.REFUNDED
			);

			expect(findOneOrderMock).toHaveBeenCalledTimes(2);
			expect(findOneCartMock).toHaveBeenCalledTimes(1);
			expect(findCartItemsMock).toHaveBeenCalledTimes(2);
			expect(findLastOrderStatusMock).toHaveBeenCalledTimes(1);

			expect(getProductStockMock).toHaveBeenCalledTimes(3);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId
			);
			expect(getProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId
			);

			expect(getProductStockMock);

			expect(updateProductStockMock).toHaveBeenCalledTimes(3);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				1,
				mockCartItems[0]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				2,
				mockCartItems[1]?.productId,
				100
			);
			expect(updateProductStockMock).toHaveBeenNthCalledWith(
				3,
				mockCartItems[2]?.productId,
				100
			);

			expect(completeOrderMock).not.toHaveBeenCalled();

			expect(updateOrderStatusMock).toHaveBeenCalledWith(
				mockOrder.id,
				OrderStatus.CANCELED,
				OrderStatus.REFUNDED
			);

			expect(result).toEqual({
				...mockFullOrder,
				status: [
					{
						oldStatus: OrderStatus.CANCELED,
						newStatus: OrderStatus.REFUNDED,
						createdAt: expect.any(Date),
					},
				],
			});
		});

		it("throws NotFoundError when order not exist", async () => {
			findOneOrderMock.mockResolvedValue(undefined);

			await expect(updateStatus(666, OrderStatus.PAID)).rejects.toThrow(
				new NotFoundError(`Order with ID '666' does not exist`)
			);

			expect(findLastOrderStatusMock).not.toHaveBeenCalled();
			expect(completeOrderMock).not.toHaveBeenCalled();
			expect(findCartItemsMock).not.toHaveBeenCalled();
			expect(getProductStockMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).not.toHaveBeenCalled();
			expect(updateOrderStatusMock).not.toHaveBeenCalled();
		});

		it("throws ValidationError when order has no previous status", async () => {
			findOneOrderMock.mockResolvedValue(mockOrder);
			findLastOrderStatusMock.mockResolvedValue(undefined);

			await expect(
				updateStatus(mockOrder.id, OrderStatus.PAID)
			).rejects.toThrow(
				new ValidationError(`Order with ID '400' has no status`)
			);

			expect(completeOrderMock).not.toHaveBeenCalled();
			expect(findCartItemsMock).not.toHaveBeenCalled();
			expect(getProductStockMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).not.toHaveBeenCalled();
			expect(updateOrderStatusMock).not.toHaveBeenCalled();
		});

		it("throws ValidationError when updating to an invalid next status", async () => {
			findOneOrderMock.mockResolvedValue(mockOrder);
			findLastOrderStatusMock.mockResolvedValue({
				current: OrderStatus.PROCESSING,
			});

			await expect(
				updateStatus(mockOrder.id, OrderStatus.PAID)
			).rejects.toThrow(
				new ValidationError(
					`Update order status from 'processing' to 'paid' is not allowed`
				)
			);

			expect(completeOrderMock).not.toHaveBeenCalled();
			expect(findCartItemsMock).not.toHaveBeenCalled();
			expect(getProductStockMock).not.toHaveBeenCalled();
			expect(updateProductStockMock).not.toHaveBeenCalled();
			expect(updateOrderStatusMock).not.toHaveBeenCalled();
		});
	});
});
