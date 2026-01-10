import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import {
	DATABASE_HOST,
	DATABASE_MAX,
	DATABASE_NAME,
	DATABASE_PORT,
	DATABASE_PW,
	DATABASE_USER,
} from "../config/config.js";
import type { Database } from "./schema.js";

const dialect: PostgresDialect = new PostgresDialect({
	pool: new Pool({
		database: DATABASE_NAME,
		host: DATABASE_HOST,
		user: DATABASE_USER,
		password: DATABASE_PW,
		port: DATABASE_PORT,
		max: DATABASE_MAX,
	}),
});

export const db: Kysely<Database> = new Kysely<Database>({
	dialect,
});
