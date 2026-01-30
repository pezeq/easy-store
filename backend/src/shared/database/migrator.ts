import { fileURLToPath } from "node:url";
import { db } from "./database.js";
import { createMigrator } from "./migration-provider.js"

async function migrateToLatest(): Promise<void> {
	const migrator = createMigrator();

	console.log("\nRunning migrations...");

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === "Success") {
			console.log(
				`Migration "${it.migrationName}" was executed successfully`
			);
		} else if (it.status === "Error") {
			console.error(`Failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error("Failed to migrate");
		console.error(error);
		process.exit(1);
	}

	console.log("\nAll migrations completed successfully");
}

async function migrateDown(): Promise<void> {
	const migrator = createMigrator();

	console.log("\nRolling back last migration...");

	const { error, results } = await migrator.migrateDown();

	results?.forEach((it) => {
		if (it.status === "Success") {
			console.log(
				`Migration "${it.migrationName}" was rolled back successfully`
			);
		} else if (it.status === "Error") {
			console.error(`Failed to rollback migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error("Failed to rollback");
		console.error(error);
		process.exit(1);
	}

	console.log("\nRollback completed successfully");
}

async function migrateDownAll(): Promise<void> {
	const migrator = createMigrator();

	console.log("\nRolling backk ALL migrations...");

	let migrationCount = 0;
	let err: unknown = null;

	while (true) {
		const { error, results } = await migrator.migrateDown();

		if (error) {
			err = error;
			break;
		}

		if (!results || results.length === 0) {
			break;
		}

		results.forEach((it) => {
			if (it.status === "Success") {
				console.log(
					`Migration "${it.migrationName}" was rolled back successfully`
				);
				migrationCount++;
			}
		});
	}

	if (err) {
		console.error("Failed to rollback all migrations");
		console.error(err);
		process.exit(1);
	}

	console.log(`\nRolled back ${migrationCount} migration(s) successfully!`);
}

async function getMigrationStatus(): Promise<void> {
	const migrator = createMigrator();

	const migrations = await migrator.getMigrations();

	if (migrations.length === 0) {
		console.log("\nNo migrations found");
		return;
	}

	console.log("\nMigration Status:");
	console.log("=".repeat(80));

	for (const migration of migrations) {
		const status =
			migration.executedAt === undefined
				? "Pending"
				: `Executed at ${migration.executedAt.toISOString()}`;

		console.log(`${migration.name}: ${status}`);
	}

	console.log("=".repeat(80));
}

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
