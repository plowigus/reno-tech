"use server";

import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { requiresAuth: true };
        }

        const userId = session.user.id;

        const existingItem = await db.query.wishlists.findFirst({
            where: and(
                eq(wishlists.userId, userId),
                eq(wishlists.productId, productId)
            ),
        });

        if (existingItem) {
            await db
                .delete(wishlists)
                .where(eq(wishlists.id, existingItem.id));

            revalidatePath("/shop"); // Revalidate where heart icons are
            return { success: true, action: 'removed' };
        } else {
            await db.insert(wishlists).values({
                userId,
                productId,
            });

            revalidatePath("/shop");
            return { success: true, action: 'added' };
        }
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        return { success: false, error: "Failed to update wishlist" };
    }
}
