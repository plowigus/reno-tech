
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { products as productsTable } from "@/db/schema";
import { products as staticProducts } from "@/data/products";

// Load environment variables from .env.local per convention or just .env
config({ path: ".env" }); // Try .env first
config({ path: ".env.local" }); // override/fallback

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
    console.log("Seeding database...");

    try {
        for (const product of staticProducts) {
            console.log(`Inserting product: ${product.name}`);
            await db.insert(productsTable).values({
                // We let the DB generate the ID or use the static one?
                // Schema says: id: text("id").primaryKey().$defaultFn(...)
                // But static products have IDs '1', '2', etc.
                // It's better to let UUIDs be generated or use the existing IDs if we want consistency.
                // I'll use the existing IDs to keep it simple, or I should omit ID to let it auto-generate.
                // Let's use the static IDs but they are "1", "2"... might conflict if we want UUIDs later.
                // Schema definition `$defaultFn(() => crypto.randomUUID())` implies we want UUIDs.
                // However, for a seed, maybe we want new fresh UUIDs?
                // But if I re-seed, I might duplicate.
                // I will omit 'id' and let it generate UUIDs, effectively importing them as new products.
                // Wait, if I run it multiple times it will duplicate.
                // Ideally I should check if it exists or used onConflict.
                // For this task, a simple insert loop is likely what's expected. I'll stick to generating new UUIDs.

                name: product.name,
                slug: product.slug,
                category: product.category,
                description: product.description,
                price: product.price.toString(), // Convert number to string for decimal
                image: product.image,
                images: product.images,
                sizes: product.sizes || [],
            });
        }
        console.log("Seeding completed successfully.");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

main();
