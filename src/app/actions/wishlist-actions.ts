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

export async function getUserWishlistIds() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const data = await db.query.wishlists.findMany({
            where: eq(wishlists.userId, session.user.id),
            columns: {
                productId: true,
            },
        });

        return data.map((item) => item.productId);
    } catch (error) {
        console.error("Error fetching wishlist IDs:", error);
        return [];
    }
}

export async function getWishlistCount() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return 0;
        }

        const count = await db.query.wishlists.findMany({
            where: eq(wishlists.userId, session.user.id),
        });

        return count.length;
    } catch (error) {
        console.error("Error fetching wishlist count:", error);
        return 0;
    }
}

export async function getWishlistItems() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const items = await db.query.wishlists.findMany({
            where: eq(wishlists.userId, session.user.id),
            with: {
                product: true,
            },
        });

        return items.map((item) => item.product);
    } catch (error) {
        console.error("Error fetching wishlist items:", error);
        return [];
    }
}
