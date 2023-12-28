
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.info("Migrating database...");
        await import('fs');
        const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
        const { db } = await import('@/migration');
        migrate(db, { migrationsFolder: '.drizzle' });
        console.info("Migration complete...");
    }
}