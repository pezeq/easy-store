import { createMigrator } from "./migration-provider.js";

export async function migrateToLatest(): Promise<void> {
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

export async function migrateDown(): Promise<void> {
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

export async function migrateDownAll(): Promise<void> {
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

export async function getMigrationStatus(): Promise<void> {
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
