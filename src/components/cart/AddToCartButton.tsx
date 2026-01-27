"use client";

import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { addToCart } from "@/app/actions/cart-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    productId: string;
    className?: string;
    iconSize?: number;
    showText?: boolean;
}

export function AddToCartButton({
    productId,
    className,
    iconSize = 20,
    showText = false
}: AddToCartButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const onOpen = useCartStore((state) => state.onOpen);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product page if button is inside a Link
        e.stopPropagation();

        setIsLoading(true);

        try {
            const result = await addToCart(productId, 1);

            if (result.requiresAuth) {
                // Set Intent Cookie
                const intent = JSON.stringify({
                    type: "cart",
                    productId,
                    quantity: 1
                });
                document.cookie = `cart_intent=${encodeURIComponent(intent)}; path=/; max-age=3600`;

                toast.info("Zaloguj się, aby dodać do koszyka");
                router.push("/login");
                return;
            }

            if (result.success) {
                toast.success("Dodano do koszyka");
                onOpen();
            } else {
                toast.error(result.error || "Wystąpił błąd");
            }
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={cn(
                "flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            {isLoading ? (
                <Loader2 size={iconSize} className="animate-spin text-white" />
            ) : (
                <>
                    <ShoppingBag size={iconSize} />
                    {showText && <span className="ml-2">Dodaj do koszyka</span>}
                </>
            )}
        </button>
    );
}
