import Database, { SqliteError } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// TODO (zeffron 2023-12-31) Import the schema and use it here.
const database = drizzle(new Database("zyf.db"), {
    schema: {},
    logger: true,
});

export function performMigrations() {
    migrate(database, { migrationsFolder: ".drizzle" });
}

function migrateIfNecessary<This, Args extends unknown[], Return>(
    original: (this: This, ...args: Args) => Promise<Return>,
): (this: This, ...args: Args) => Promise<Return> {
    const replacement = async function (this: This, ...args: Args) {
        try {
            return await original.apply(this, args);
        } catch (error) {
            if (process.env.NODE_ENV !== "development") {
                // We only automigrate in development as a convenience to the
                // developer. In production, we expect there to be no changes
                // since the migration on startup.
                throw error;
            }
            console.log(
                `Error is a SqliteError? ${error instanceof SqliteError}`,
            );
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
            return original.apply(this, args);
        }
    };
    return replacement;
}
