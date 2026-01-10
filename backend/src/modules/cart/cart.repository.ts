import { sql, type UpdateResult } from "kysely";
import { db } from "../../shared/database/database";
import type { SelectCart } from "../../shared/types/kysely.types";
import type { CartDTO, CartItemDTO } from "./cart.types";
import { publicCartItemsCols } from "./cart.types";

export async function findAllCarts(): Promise<SelectCart[]> {
	return await db
		.selectFrom("carts") //
		.selectAll() //
		.execute();
}

export async function findOneCart(id: number): Promise<CartDTO> {
	return await db
		.selectFrom("carts")
		.select([
			"id",
			"user_id as userId",
			"created_at as createdAt",
			"updated_at as updatedAt",
			"converted_at as convertedAt",
		])
		.where("id", "=", id)
		.executeTakeFirstOrThrow();
}

export async function findCartItems(id: number): Promise<CartItemDTO[]> {
	return await db
		.selectFrom("cart_items")
		.select(publicCartItemsCols)
		.where("cart_id", "=", id)
		.orderBy("addedAt")
		.execute();
}

export async function findOpenCart(
	id: number
): Promise<{ id: number } | undefined> {
	return await db
		.selectFrom("carts")
		.select(["id"])
		.where("user_id", "=", id)
		.where("converted_at", "is", null)
		.executeTakeFirst();
}

export async function getCartOwnerId(id: number): Promise<{ ownerId: number }> {
	return await db
		.selectFrom("carts")
		.where("id", "=", id)
		.select(["user_id as ownerId"])
		.executeTakeFirstOrThrow();
}

export async function getCartProducts(
	id: number
): Promise<Array<{ id: number }> | undefined> {
	return await db
		.selectFrom("cart_items")
		.select("product_id as id")
		.where("cart_id", "=", id)
		.execute();
}

export async function getProductQuantityInCart(
	cartId: number,
	productId: number
): Promise<{ quantityInCart: number }> {
	return await db
		.selectFrom("cart_items")
		.select(["quantity as quantityInCart"])
		.where("cart_id", "=", cartId)
		.where("product_id", "=", productId)
		.executeTakeFirstOrThrow();
}

export async function createNewCart(
	userId: number
): Promise<{ cartId: number }> {
	return await db
		.insertInto("carts")
		.values({ user_id: userId })
		.returning(["id as cartId"])
		.executeTakeFirstOrThrow();
}

export async function addProductToCart(
	cartId: number,
	productId: number,
	quantity: number,
	unitPrice: number,
	totalPrice: number
): Promise<CartItemDTO> {
	return await db
		.insertInto("cart_items")
		.values({
			cart_id: cartId,
			product_id: productId,
			quantity,
			unit_price: unitPrice,
			total_price: totalPrice,
			removed_at: null,
		})
		.returning(publicCartItemsCols)
		.executeTakeFirstOrThrow();
}

export async function addProuctQuantityInCart(
	cartId: number,
	productId: number,
	quantity: number
): Promise<CartItemDTO> {
	return await db
		.updateTable("cart_items")
		.set({
			quantity: sql`quantity + ${quantity}`,
			total_price: sql`total_price + (unit_price * ${quantity})`,
			removed_at: null,
		})
		.where("cart_id", "=", cartId)
		.where("product_id", "=", productId)
		.returning(publicCartItemsCols)
		.executeTakeFirstOrThrow();
}

export async function updateProuctQuantityInCart(
	cartId: number,
	productId: number,
	quantity: number
): Promise<CartItemDTO> {
	return await db
		.updateTable("cart_items")
		.set({
			quantity,
			total_price: sql`unit_price * ${quantity}`,
			removed_at: null,
		})
		.where("cart_id", "=", cartId)
		.where("product_id", "=", productId)
		.returning(publicCartItemsCols)
		.executeTakeFirstOrThrow();
}

export async function removeProductFromCart(
	cartId: number,
	productId: number
): Promise<UpdateResult> {
	return await db
		.updateTable("cart_items")
		.set({
			quantity: 0,
			unit_price: 0,
			total_price: 0,
			removed_at: new Date(),
		})
		.where("cart_id", "=", cartId)
		.where("product_id", "=", productId)
		.executeTakeFirstOrThrow();
}
