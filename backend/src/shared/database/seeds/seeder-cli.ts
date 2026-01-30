import { fileURLToPath } from "node:url";
import { db } from "../database.js";
import { clearDatabase, seed } from "./seed.js";

async function main() {
	const command = process.argv[2];

	try {
		switch (command) {
			case "run":
				await seed();
				break;
			case "clear":
				await clearDatabase();
				break;
			case "refresh":
				await clearDatabase();
				console.log("\n");
				await seed();
				break;
			default:
				console.log(`
Kysely Seeder CLI

Usage: 
pnpm seed <command>

Commands:
run       Run all seeds
clear     Clear all data from tables
refresh   Clear and re-seed database

Examples:
pnpm seed run
pnpm seed clear
pnpm seed refresh
                `);
				break;
		}

		await db.destroy();
	} catch (error) {
		console.error({
			message: "Seeding Error",
			error,
		});
		process.exit(1);
	}
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
	main();
}
