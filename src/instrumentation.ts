export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.info("Migrating database...");
        await import('fs');
        const { performMigrations } = (await import('@/lib/database'));
        performMigrations();
        console.info("Migration complete...");
    }
}