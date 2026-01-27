"use client";

import { useEffect } from "react";
import { addToCart } from "@/app/actions/cart-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function deleteCookie(name: string) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function CartSyncer({ userId }: { userId?: string }) {
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;

        const checkIntent = async () => {
            const intentCookie = getCookie("cart_intent");

            if (intentCookie) {
                try {
                    const intent = JSON.parse(decodeURIComponent(intentCookie));

                    if (intent.type === "cart" && intent.productId) {
                        const result = await addToCart(intent.productId, intent.quantity || 1);

                        if (result.success) {
                            toast.success("Produkt został dodany do koszyka");
                            deleteCookie("cart_intent");
                            router.refresh();
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse cart intent", e);
                }
            }
        };

        checkIntent();
    }, [userId, router]);

    return null;
}
