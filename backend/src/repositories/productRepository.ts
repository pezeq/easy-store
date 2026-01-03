import type { UpdateResult } from "kysely";
import { db } from "../database";
import type { NewProduct, ProductDTO } from "../types/productTypes";

const publicProductCols = [
	"id",
	"name",
	"sku",
	"description",
	"price",
	"stock_quantity as stockQuantity",
	"size",
	"weight",
	"brand_id as brandId",
	"created_at as createdAt",
] as const;

export async function insertProduct(
	newProduct: NewProduct
): Promise<ProductDTO> {
	return await db
		.insertInto("products")
		.values(newProduct)
		.returning(publicProductCols)
		.executeTakeFirstOrThrow();
}

export async function findProductById(id: string): Promise<ProductDTO> {
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

export async function deleteProductById(id: string): Promise<UpdateResult> {
	return await db
		.updateTable("products")
		.where("id", "=", id)
		.where("deleted_at", "is", null)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}

export async function deleteAllProducts(): Promise<UpdateResult> {
	return await db
		.updateTable("products")
		.where("deleted_at", "is", null)
		.set("deleted_at", new Date())
		.executeTakeFirst();
}
