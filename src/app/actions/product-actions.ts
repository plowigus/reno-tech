"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { productSchema, ProductFormValues } from "@/lib/validators/product-schema";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

export async function createProduct(data: ProductFormValues) {
    try {
        const validatedFields = productSchema.safeParse(data);

        if (!validatedFields.success) {
            return {
                success: false,
                error: "Błąd walidacji danych.",
            };
        }

        const { name, category, description, price, images, sizes } =
            validatedFields.data;

        const slug = generateSlug(name);

        await db.insert(products).values({
            name,
            slug,
            category,
            description,
            price: price.toString(),
            image: images[0],
            images,
            sizes: sizes || [],
        });

        revalidatePath("/dashboard/admin/products");
        revalidatePath("/shop");

        return { success: true };
    } catch (error: any) {
        console.error("Error creating product:", error);

        // Obsługa błędu unikalności (np. zduplikowany slug)
        if (error.code === "23505") {
            return {
                success: false,
                error: "Produkt o takiej nazwie (lub slugu) już istnieje.",
            };
        }

        return {
            success: false,
            error: "Wystąpił błąd podczas tworzenia produktu.",
        };
    }
}
