import { fileURLToPath } from "node:url";
import { db } from "./database.js";
import {
	getMigrationStatus,
	migrateDown,
	migrateDownAll,
	migrateToLatest,
} from "./migrator.js";

async function main() {
	const command = process.argv[2];

	try {
		switch (command) {
			case "up":
				await migrateToLatest();
				break;
			case "down":
				await migrateDown();
				break;
			case "down:all":
				await migrateDownAll();
				break;
			case "status":
				await getMigrationStatus();
				break;
			default:
				console.log(`
Kysely Migration CLI

Usage: 
pnpm migrate <command>

Commands:
up            Run all pending migrations
down          Rollback the last migration
down:all      Rollback all migrations
status        Show migration status

Examples:
pnpm migrate up
pnpm migrate down
pnpm migrate status
                `);
				break;
		}

		await db.destroy();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
	main();
}
