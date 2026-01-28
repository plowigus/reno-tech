"use client";

import { useEffect } from "react";
import { addToCart, getCart } from "@/app/actions/cart-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/use-cart-store";

function getCookie(name: string) {
    if (typeof document === 'undefined') return undefined; // Server-side safety
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function CartSyncer({ userId }: { userId?: string }) {
    const router = useRouter();
    const setItems = useCartStore((state) => state.setItems);

    useEffect(() => {
        if (!userId) {
            setItems([]); // Clear cart if no user
            return;
        }

        const syncCart = async () => {
            // 1. Check for Intent (Pending Add to Cart)
            const intentCookie = getCookie("cart_intent");
            let intentProcessed = false;

            if (intentCookie) {
                try {
                    const intent = JSON.parse(decodeURIComponent(intentCookie));

                    if (intent.type === "cart" && intent.productId) {
                        const result = await addToCart(intent.productId, intent.quantity || 1, intent.size);

                        if (result.success) {
                            toast.success("Produkt został dodany do koszyka");
                            deleteCookie("cart_intent");
                            intentProcessed = true;
                            router.refresh(); // Refresh server components
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse cart intent", e);
                }
            }

            // 2. Fetch latest cart data and update store
            try {
                const cart = await getCart();
                if (cart && cart.items) {
                    setItems(cart.items);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Failed to sync cart", error);
            }
        };

        syncCart();
    }, [userId, router, setItems]);

    return null;
}
