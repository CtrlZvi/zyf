import Database, { SqliteError } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { accounts } from "~/routes/accounts/schema";

export const database = drizzle(new Database("zyf.db"), {
    schema: { accounts },
    logger: true,
});

export function performMigrations() {
    migrate(database, { migrationsFolder: ".drizzle" });
}

export async function migrateIfNecessary<Return>(
    original: () => Promise<Return>,
): Promise<Return> {
    console.log("Attempting action that may need migration...");
    try {
        return await original();
    } catch (error) {
        console.log("Action failed.");
        if (process.env.NODE_ENV !== "development") {
            // We only automigrate in development as a convenience to the
            // developer. In production, we expect there to be no changes
            // since the migration on startup.
            throw error;
        }
        console.log(`Error is a SqliteError? ${error instanceof SqliteError}`);
        if (!(error instanceof SqliteError)) {
            throw error;
        }

        if (error.message.startsWith("no such column: ")) {
            console.warn("Missing column detected, running migrations...");
        } else if (error.message.startsWith("no such table: ")) {
            console.warn("Missing table detected, running migrations...");
        } else {
            throw error;
        }
        performMigrations();
        console.info("Migration complete...");
        return original();
    }
}
