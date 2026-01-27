"use server";

import { db } from "@/db";
import { carts, cartItems, products } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addToCart(productId: string, quantity: number = 1) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { requiresAuth: true };
        }

        const userId = session.user.id;

        // 1. Get or Create Cart
        let cart = await db.query.carts.findFirst({
            where: eq(carts.userId, userId),
        });

        if (!cart) {
            const [newCart] = await db
                .insert(carts)
                .values({ userId })
                .returning();
            cart = newCart;
        }

        // 2. Check if item exists in cart
        const existingItem = await db.query.cartItems.findFirst({
            where: and(
                eq(cartItems.cartId, cart.id),
                eq(cartItems.productId, productId)
            ),
        });

        if (existingItem) {
            // Update quantity
            await db
                .update(cartItems)
                .set({ quantity: existingItem.quantity + quantity })
                .where(eq(cartItems.id, existingItem.id));
        } else {
            // Add new item
            await db.insert(cartItems).values({
                cartId: cart.id,
                productId,
                quantity,
            });
        }

        revalidatePath("/cart");
        revalidatePath("/shop"); // Optional: if we show cart count in header everywhere

        return { success: true };
    } catch (error) {
        console.error("Error adding to cart:", error);
        return { success: false, error: "Failed to add to cart" };
    }
}

export async function getCart() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return null;
        }

        const cart = await db.query.carts.findFirst({
            where: eq(carts.userId, session.user.id),
            with: {
                items: {
                    with: {
                        product: true,
                    },
                    orderBy: (items, { desc }) => [desc(items.id)], // Order by added time roughly
                },
            },
        });

        return cart;
    } catch (error) {
        console.error("Error getting cart:", error);
        return null;
    }
}
