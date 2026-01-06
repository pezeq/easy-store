import { db } from "../../shared/database/database";
import type { InsertProduct } from "../../shared/types/kysely.types";
import { type ProductDTO, publicProductCols } from "./product.types";

export async function createNewProduct(
	newProduct: InsertProduct
): Promise<ProductDTO> {
	return await db
		.insertInto("products")
		.values(newProduct)
		.returning(publicProductCols)
		.executeTakeFirstOrThrow();
}

export async function findProductById(id: number): Promise<ProductDTO> {
	return await db
		.selectFrom("products")
		.select(publicProductCols)
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.executeTakeFirstOrThrow();
}

export async function findAllProducts(): Promise<ProductDTO[]> {
	return await db
		.selectFrom("products")
		.select(publicProductCols)
		.where("deleted_at", "is", null)
		.execute();
}

export async function deleteProductById(id: number): Promise<void> {
	await db
		.updateTable("products")
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}

export async function deleteAllProducts(): Promise<void> {
	await db
		.updateTable("products")
		.where("deleted_at", "is", null)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}
