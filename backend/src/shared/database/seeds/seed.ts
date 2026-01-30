// biome-ignore-all lint/style/noNonNullAssertion: no problem here
// biome-ignore-all lint/suspicious/noExplicitAny: no problem here

import { UserRole } from "@shared/types/custom.types.js";
import { sql } from "kysely";
import { db } from "../database.js";

export async function seed() {
	console.log("Starting database seeding...\n");

	try {
		console.log("Seeding users...");

		const users = await db
			.insertInto("users")
			.values([
				{
					name: "Admin User",
					username: "admin",
					email: "admin@easystore.com",
					password_hash:
						"$2a$10$6JJRPZ6ZGNhXC0rRPIC3.ewDav3kMf4HrThnVbN/acmplKtvFP4yC",
					phone_number: "+5531999999999",
					role: UserRole.ADMIN,
				},
				{
					name: "John Seller",
					username: "john",
					email: "john@easystore.com",
					password_hash:
						"$2a$10$ubX9azkfJRi3UbCT20Ucv.6oHIm0OQKzSICHAqNKuL.jN1UoKHcnK",
					phone_number: "+5531888888888",
					role: UserRole.SELLER,
				},
				{
					name: "Maria Nobody",
					username: "maria",
					email: "maria@example.com",
					password_hash:
						"$2a$10$qqFWwwSkosRKdFiTlqzE5.0fGrIVjje5StCoTfaJAk1CycAQIpIl.",
					phone_number: "+5531777777777",
					role: UserRole.CUSTOMER,
				},
				{
					name: "Saul Someone",
					username: "saul",
					email: "saul@example.com",
					password_hash:
						"$2a$10$CQ3TXLUkJcr5nK2boXPtmOH0NS5zT1vTQ8hkj997Q861Kxd8LCQLq",
					phone_number: "+5531666666666",
					role: UserRole.CUSTOMER,
				},
			])
			.returning("id")
			.execute();

		console.log(`Created ${users.length} users\n`);

		console.log("Seeding brands...");

		const brands = await db
			.insertInto("brands")
			.values([
				{ name: "Nike" },
				{ name: "Adidas" },
				{ name: "Samsung" },
				{ name: "Apple" },
				{ name: "Sony" },
			])
			.returning("id")
			.execute();

		console.log(`Created ${brands.length} brands\n`);

		console.log("Seeding products...");

		const products = await db
			.insertInto("products")
			.values([
				{
					name: "Nike Air Max 90",
					sku: "NIKE-AM90-01",
					description: "Classic Nike running shoes",
					price: 599.9,
					stock_quantity: 50,
					brand_id: brands[0]!.id,
				},
				{
					name: "Adidas Ultraboost",
					sku: "ADID-UB-01",
					description:
						"Comfortable running shoes with boost technology",
					price: 699.9,
					stock_quantity: 30,
					brand_id: brands[1]!.id,
				},
				{
					name: "Samsung Galaxy S24",
					sku: "SAMS-GS24-01",
					description: "Latest Samsung flagship smartphone",
					price: 4999.9,
					stock_quantity: 20,
					brand_id: brands[2]!.id,
				},
				{
					name: "iPhone 15 Pro",
					sku: "APPL-I15P-01",
					description: "Apple's latest pro smartphone",
					price: 7999.9,
					stock_quantity: 15,
					brand_id: brands[3]!.id,
				},
				{
					name: "Sony WH-1000XM5",
					sku: "SONY-WXM5-01",
					description: "Premium noise-canceling headphones",
					price: 1999.9,
					stock_quantity: 25,
					brand_id: brands[4]!.id,
				},
			])
			.returning("id")
			.execute();

		console.log(`Created ${products.length} products\n`);

		console.log("Database seeding completed successfully!");
	} catch (error) {
		console.error("Error seeding database:", error);
		throw error;
	}
}

export async function clearDatabase() {
	console.log("\nClearing database...");

	const tables = [
		"product_reviews",
		"shippings",
		"addresses",
		"payments",
		"order_status_history",
		"orders",
		"cart_items",
		"carts",
		"product_categories",
		"product_galleries",
		"product_attributes",
		"products",
		"images",
		"categories",
		"attributes",
		"brands",
		"users",
	];

	for (const table of tables) {
		await db.deleteFrom(table as any).execute();
		console.log(`Cleared ${table}`);
	}

	console.log("\nResetting ID sequences...\n");

	const tablesWithSequences = [
		"users",
		"brands",
		"attributes",
		"categories",
		"images",
		"products",
		"product_reviews",
		"carts",
		"cart_items",
		"orders",
		"order_status_history",
		"payments",
		"addresses",
		"shippings",
	];

	for (const table of tablesWithSequences) {
		await sql`
            ALTER SEQUENCE ${sql.raw(`${table}_id_seq`)} RESTART WITH 1
        `.execute(db);
		console.log(`Reset sequence for ${table}`);
	}

	console.log("\nDatabase cleared and sequences reset successfully!");
}
