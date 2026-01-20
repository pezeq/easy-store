import {
	AuthError,
	NotFoundError,
	ValidationError,
} from "@shared/errors/appErrors.js";
import {
	getProductPrice,
	getProductStock,
	updateProductStock,
} from "../product/product.repository.js";
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
} from "./cart.repository.js";
import type { CartDTO, CartItemDTO, FullCartDTO } from "./cart.types.js";

const getAll = async (): Promise<CartDTO[]> => {
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
	const cartId = openCart?.id ?? (await createNewCart(userId)).id;

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

	const { stockQuantity } = await getProductStock(productId);
	const { price } = await getProductPrice(productId);

	if (quantity > stockQuantity) {
		throw new ValidationError(
			`Product with ID ${productId}, has ${stockQuantity} item(s) in stock.`
		);
	}

	const totalPrice = price * quantity;

	const productsInCart = await getCartProducts(cartId);

	const hasProduct = productsInCart?.some((p) => p.id === productId);

	const cartItem = hasProduct
		? await addProuctQuantityInCart(cartId, productId, quantity)
		: await addProductToCart(
				cartId,
				productId,
				quantity,
				price,
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
	if (quantity < 0) {
		throw new ValidationError("Product quantity can not be negative");
	}

	const { ownerId } = await getCartOwnerId(cartId);

	if (ownerId !== userId) {
		throw new AuthError("User does not own this cart.");
	}

	const productsInCart = await getCartProducts(cartId);

	const hasProduct = productsInCart?.some((p) => p.id === productId);

	if (!hasProduct) {
		throw new NotFoundError(
			`Product ID ${productId}, was not found in cart ID ${cartId}`
		);
	}

	if (quantity === 0) {
		await removeProduct(userId, cartId, productId);
		return;
	}

	const { stockQuantity } = await getProductStock(productId);

	if (quantity > stockQuantity) {
		throw new ValidationError(
			`Product with ID ${productId}, has ${stockQuantity} item(s) in stock.`
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

	const { stockQuantity } = await getProductStock(productId);

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
