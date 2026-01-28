
import "dotenv/config";
import { db } from "@/db";
import { forumCategories } from "@/db/schema";
import { exit } from "process";

const categories = [
    {
        name: "Warsztat",
        slug: "warsztat",
        description: "Porady techniczne, naprawy, diagnostyka i wymiana części.",
        icon: "Wrench",
        order: 1,
    },
    {
        name: "Tuning",
        slug: "tuning",
        description: "Modyfikacje mechaniczne i wizualne, zwiększanie mocy.",
        icon: "Zap",
        order: 2,
    },
    {
        name: "Car Audio",
        slug: "car-audio",
        description: "Systemy nagłośnienia, radia, wygłuszanie i multimedia.",
        icon: "Speaker",
        order: 3,
    },
    {
        name: "Projekty",
        slug: "projekty",
        description: "Dzienniki budowy, prezentacje Waszych samochodów i postęp prac.",
        icon: "Car",
        order: 4,
    },
    {
        name: "Giełda",
        slug: "gielda",
        description: "Kupię, sprzedam, zamienię - części i samochody.",
        icon: "ShoppingCart",
        order: 5,
    },
    {
        name: "Off-topic",
        slug: "off-topic",
        description: "Rozmowy na każdy temat luźno związany z motoryzacją.",
        icon: "Coffee",
        order: 6,
    },
];

async function seed() {
    console.log("🌱 Starting forum seeding...");

    try {
        console.log("Cleaning existing categories...");
        await db.delete(forumCategories);

        console.log("Inserting new categories...");
        await db.insert(forumCategories).values(categories);

        console.log("✅ Forum categories seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding forum:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seed();
