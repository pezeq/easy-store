import { AppError, AuthError } from "../../shared/errors/appErrors";
import type { SelectCart } from "../../shared/types/kysely.types";
import {
	getProductStockAndPrice,
	updateProductStock,
} from "../product/product.repository";
import {
	addProductToCart,
	addProuctQuantityInCart,
	createNewCart,
	findAllCarts,
	findCartItems,
	findOneCart,
	findOpenCart,
	getCartOwnerId,
	getCartProducts,
	getProductQuantityInCart,
	removeProductFromCart,
	updateProuctQuantityInCart,
} from "./cart.repository";
import type { CartItemDTO, FullCartDTO } from "./cart.types";

const getAll = async (): Promise<SelectCart[]> => {
	return findAllCarts();
};

const getOne = async (id: number): Promise<FullCartDTO> => {
	const cart = await findOneCart(id);
	const cartItems = await findCartItems(id);
	return {
		...cart,
		cartItems,
	};
};

const createNew = async (
	userId: number,
	productId: number,
	quantity: number
): Promise<FullCartDTO> => {
	const openCart = await findOpenCart(userId);
	const cartId = openCart?.id ?? (await createNewCart(userId)).cartId;

	await addProduct(userId, cartId, productId, quantity);

	return await getOne(cartId);
};

const addProduct = async (
	userId: number,
	cartId: number,
	productId: number,
	quantity: number
): Promise<CartItemDTO> => {
	const { ownerId } = await getCartOwnerId(cartId);

	if (ownerId !== userId) {
		throw new AuthError("User does not own this cart.");
	}

	const { stockQuantity, unitPrice } =
		await getProductStockAndPrice(productId);

	if (quantity > stockQuantity) {
		throw new AppError(
			`Product with ID ${productId}, has ${stockQuantity} item(s) in stock.`,
			400
		);
	}

	const totalPrice = unitPrice * quantity;

	const productsInCart = await getCartProducts(cartId);

	const hasProduct = productsInCart?.some((p) => p.id === productId);

	const cartItem = hasProduct
		? await await addProuctQuantityInCart(cartId, productId, quantity)
		: await addProductToCart(
				cartId,
				productId,
				quantity,
				unitPrice,
				totalPrice
			);

	const updatedStock = stockQuantity - quantity;

	await updateProductStock(productId, updatedStock);

	return cartItem;
};

export const updateQuantity = async (
	userId: number,
	cartId: number,
	productId: number,
	quantity: number
): Promise<CartItemDTO | undefined> => {
	const { ownerId } = await getCartOwnerId(cartId);

	if (ownerId !== userId) {
		throw new AuthError("User does not own this cart.");
	}

	const productsInCart = await getCartProducts(cartId);

	const hasProduct = productsInCart?.some((p) => p.id === productId);

	if (!hasProduct) {
		throw new AppError(
			`Product ID ${productId}, was not found in cart ID ${cartId}`,
			404
		);
	}

	if (!quantity) {
		removeProduct(userId, cartId, productId);
		return;
	}

	const { stockQuantity } = await getProductStockAndPrice(productId);

	if (quantity > stockQuantity) {
		throw new AppError(
			`Product with ID ${productId}, has ${stockQuantity} item(s) in stock.`,
			400
		);
	}

	const { quantityInCart } = await getProductQuantityInCart(
		cartId,
		productId
	);

	const cartItem = await updateProuctQuantityInCart(
		cartId,
		productId,
		quantity
	);

	const updatedStock = stockQuantity + quantityInCart - quantity;

	await updateProductStock(productId, updatedStock);

	return cartItem;
};

const removeProduct = async (
	userId: number,
	cartId: number,
	productId: number
): Promise<void> => {
	const { ownerId } = await getCartOwnerId(cartId);

	if (ownerId !== userId) {
		throw new AuthError("User does not own this cart.");
	}

	const { quantityInCart } = await getProductQuantityInCart(
		cartId,
		productId
	);

	const { stockQuantity } = await getProductStockAndPrice(productId);

	const updatedStock = quantityInCart + stockQuantity;

	await removeProductFromCart(cartId, productId);
	await updateProductStock(productId, updatedStock);
};

export default {
	getAll,
	getOne,
	createNew,
	addProduct,
	updateQuantity,
	removeProduct,
};
