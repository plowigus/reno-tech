import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";
import { products as staticProducts } from "@/data/products";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Ładujemy zmienne z .env
config({ path: ".env" });
config({ path: ".env.local" }); // Na wypadek gdybyś trzymał je w local

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
    console.log("Seeding database...");

    // --- ZABEZPIECZENIE ---
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error("❌ BŁĄD: Brak ADMIN_EMAIL lub ADMIN_PASSWORD w pliku .env");
        console.error("Dodaj je, aby utworzyć konto administratora.");
        process.exit(1);
    }
    // -----------------------

    try {
        // 1. Seed Products (Bez zmian)
        console.log("Seeding products...");
        for (const product of staticProducts) {
            const existingProduct = await db.query.products.findFirst({
                where: eq(schema.products.slug, product.slug)
            });

            if (!existingProduct) {
                console.log(`Inserting product: ${product.name}`);
                await db.insert(schema.products).values({
                    name: product.name,
                    slug: product.slug,
                    category: product.category,
                    description: product.description,
                    price: product.price.toString(),
                    image: product.image,
                    images: product.images,
                    sizes: product.sizes || [],
                });
            } else {
                console.log(`Product ${product.name} already exists. Skipping.`);
            }
        }

        // 2. Seed Admin User (Używamy zmiennych z .env)
        console.log(`Checking for admin user: ${adminEmail}`);

        const existingAdmin = await db.query.users.findFirst({
            where: eq(schema.users.email, adminEmail)
        });

        if (!existingAdmin) {
            console.log("Creating new admin user...");
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await db.insert(schema.users).values({
                name: "Admin User",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
            });
            console.log(`✅ Admin user created: ${adminEmail}`);
        } else {
            console.log("Admin user exists. Updating role to 'admin'...");
            // Opcjonalnie: Możemy też zaktualizować hasło, jeśli zmieniłeś je w .env
            // const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await db.update(schema.users)
                .set({
                    role: "admin",
                    // password: hashedPassword // Odkomentuj, jeśli seed ma też resetować hasło admina
                })
                .where(eq(schema.users.email, adminEmail));
            console.log("✅ Admin role updated.");
        }

        console.log("🚀 Seeding completed successfully.");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

main();