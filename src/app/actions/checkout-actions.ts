"use server";

import { db } from "@/db";
import { carts, cartItems, orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validators/checkout-schema";
import { registerP24Transaction } from "@/lib/przelewy24";
import { v4 as uuidv4 } from "uuid";

export async function createOrder(data: CheckoutFormValues) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Musisz być zalogowany, aby złożyć zamówienie." };
        }
        const userId = session.user.id;

        // 1. Validate Form
        const validatedFields = checkoutSchema.safeParse(data);
        if (!validatedFields.success) {
            return { error: "Nieprawidłowe dane formularza." };
        }
        const { customerName, customerEmail, shippingStreet, shippingCity, shippingPostalCode, shippingCountry } = validatedFields.data;

        // 2. Get Cart
        const cart = await db.query.carts.findFirst({
            where: eq(carts.userId, userId),
            with: {
                items: {
                    with: { product: true }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return { error: "Twój koszyk jest pusty." };
        }

        // 3. Calculate Totals
        const subtotal = cart.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
        const shippingCost = 9.99;
        const totalAmount = subtotal + shippingCost; // P24 might need conversion to integer (Grosze) inside the helper

        const p24SessionId = `order_${uuidv4()}`;

        // 4. DB Transaction
        // We use a transaction to ensure atomicity
        const redirectUrl = await db.transaction(async (tx) => {
            // Create Order
            const [newOrder] = await tx.insert(orders).values({
                userId,
                customerName,
                customerEmail,
                shippingStreet,
                shippingCity,
                shippingPostalCode,
                shippingCountry,
                status: "pending",
                totalAmount: String(totalAmount), // check decimal handling
                p24SessionId,
                p24OrderId: 0, // Pending real ID, will be updated or kept 0 if mock
            }).returning();

            // Create Order Items
            for (const item of cart.items) {
                await tx.insert(orderItems).values({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    priceAtPurchase: String(item.product.price),
                });
            }

            // Clear Cart
            await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

            // 5. Register Payment
            const p24Result = await registerP24Transaction({
                sessionId: p24SessionId,
                amount: totalAmount, // Helper should handle mulitplication by 100 if needed, or we assume input is PLN
                currency: "PLN",
                description: `Zamówienie ${newOrder.id}`,
                email: customerEmail,
                urlReturn: `${process.env.NEXT_PUBLIC_APP_URL}/order-success`,
                urlStatus: `${process.env.NEXT_PUBLIC_APP_URL}/api/p24/status`,
            });

            if (p24Result.error || !p24Result.redirectUrl) {
                throw new Error("P24 Registration Failed");
            }

            // --- SIMULATION MODE CHECK ---
            if (p24Result.redirectUrl.includes("mock=true")) {
                console.log("Detecting Simulation Mode - Mark order as PAID");
                await tx.update(orders)
                    .set({ status: "paid" })
                    .where(eq(orders.id, newOrder.id));
            }

            return p24Result.redirectUrl;
        });

        return { success: true, redirectUrl };

    } catch (error) {
        console.error("Order creation error:", error);
        return { error: "Wystąpił błąd podczas tworzenia zamówienia." };
    }
}
