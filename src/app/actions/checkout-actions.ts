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
        console.log("createOrder: Session user ID:", session?.user?.id);
        if (!session?.user?.id) {
            console.error("createOrder: No user ID found in session");
            return { error: "Musisz być zalogowany, aby złożyć zamówienie." };
        }
        const userId = session.user.id;

        // 1. Validate Form
        const validatedFields = checkoutSchema.safeParse(data);
        if (!validatedFields.success) {
            console.error("createOrder: Validation failed", validatedFields.error);
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
            console.error("createOrder: Cart is empty or not found");
            return { error: "Twój koszyk jest pusty." };
        }
        console.log("createOrder: Cart found with items:", cart.items.length);

        // 3. Calculate Totals
        const subtotal = cart.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
        const shippingCost = 9.99;
        const totalAmount = subtotal + shippingCost; // P24 might need conversion to integer (Grosze) inside the helper

        const p24SessionId = `order_${uuidv4()}`;

        // 4. DB Transaction
        // 4. Create Order & Process Payment (Sequential, No Transaction)
        console.log("createOrder: Inserting order...");
        let newOrder;

        try {
            // A. Create Order
            const [createdOrder] = await db.insert(orders).values({
                userId,
                customerName,
                customerEmail,
                shippingStreet,
                shippingCity,
                shippingPostalCode,
                shippingCountry,
                status: "pending",
                totalAmount: String(totalAmount),
                p24SessionId,
                p24OrderId: 0,
            }).returning();
            newOrder = createdOrder;
            console.log("createOrder: Order inserted", newOrder.id);

            // B. Create Order Items
            for (const item of cart.items) {
                await db.insert(orderItems).values({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    priceAtPurchase: String(item.product.price),
                });
            }
            console.log("createOrder: Order items inserted");

            // C. Clear Cart
            await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
            console.log("createOrder: Cart cleared");

            // D. Register Payment
            console.log("createOrder: Registering P24 transaction...");
            const p24Result = await registerP24Transaction({
                sessionId: p24SessionId,
                amount: totalAmount,
                currency: "PLN",
                description: `Zamówienie ${newOrder.id}`,
                email: customerEmail,
                urlReturn: `${process.env.NEXT_PUBLIC_APP_URL}/order-success`,
                urlStatus: `${process.env.NEXT_PUBLIC_APP_URL}/api/p24/status`,
            });
            console.log("createOrder: P24 result:", p24Result);

            if (p24Result.error || !p24Result.redirectUrl) {
                console.error("createOrder: P24 error:", p24Result.error);
                throw new Error("P24 Registration Failed");
            }

            // E. Simulation Mode Check
            if (p24Result.redirectUrl.includes("mock=true")) {
                console.log("Detecting Simulation Mode - Mark order as PAID");
                await db.update(orders)
                    .set({ status: "paid" })
                    .where(eq(orders.id, newOrder.id));
            }

            console.log("createOrder: Success, redirecting to:", p24Result.redirectUrl);
            return { success: true, redirectUrl: p24Result.redirectUrl };

        } catch (innerError) {
            console.error("createOrder: Error during sequential operations, attempting rollback...", innerError);

            // Manual Rollback: Delete the order if it was created
            if (newOrder?.id) {
                try {
                    await db.delete(orders).where(eq(orders.id, newOrder.id));
                    console.log("createOrder: Rollback successful (Order deleted)");
                } catch (rollbackError) {
                    console.error("createOrder: CRITICAL - Rollback failed", rollbackError);
                }
            }
            throw innerError; // Re-throw to be caught by outer try/catch
        }



    } catch (error) {
        console.error("Order creation error (FULL):", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return { error: "Wystąpił błąd podczas tworzenia zamówienia. Sprawdź konsolę serwera." };
    }
}
