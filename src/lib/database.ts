import Database, { SqliteError } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as accountSchema from '@/app/accounts/schema';

const database = drizzle(new Database('zyf.db'), { schema: { ...accountSchema }, logger: true });

export function performMigrations() {
    migrate(database, { migrationsFolder: '.drizzle' });
}

function migrateIfNecessary<This, Args extends any[], Return>(original: (this: This, ...args: Args) => Promise<Return>): (this: This, ...args: Args) => Promise<Return> {
    const replacement = async function (this: This, ...args: Args) {
        try {
            return await original.apply(this, args);
        } catch (error) {
            if (process.env.NODE_ENV !== 'development') {
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
                console.warn("Missing column detected, running migrations...")
            } else if (error.message.startsWith("no such table: ")) {
                console.warn("Missing table detected, running migrations...")
            } else {
                throw error;
            }
            performMigrations();
            console.info("Migration complete...");
            return original.apply(this, args);
        }
    }
    return replacement;
}

export const fetchAccounts = migrateIfNecessary(async () => {
    // TODO (zeffron 2023-12-28) Figure out how to perform the prepare once. We
    // need to do the preparation inside this function as it could throw an
    // error if the migrations haven't run, but we need to memoize the result
    // (with type information).
    return await database.query.accounts.findMany().prepare().all();
})