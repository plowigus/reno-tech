"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/app/actions/wishlist-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/use-wishlist-store";

interface WishlistButtonProps {
    productId: string;
    initialIsWishlisted: boolean;
    className?: string;
}

export function WishlistButton({
    productId,
    initialIsWishlisted,
    className,
}: WishlistButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [optimisticIsWishlisted, toggleOptimisticWishlist] = useOptimistic(
        initialIsWishlisted,
        (state, newState: boolean) => newState
    );

    // We can't easily destructure store selectors like { increment } = useWishlistStore() because it returns the state directly if no selector
    // So distinct selectors are safer:
    const increment = useWishlistStore((state) => state.increment);
    const decrement = useWishlistStore((state) => state.decrement);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const willBeWishlisted = !optimisticIsWishlisted;

        startTransition(async () => {
            toggleOptimisticWishlist(willBeWishlisted);

            // Update global store instantly
            if (willBeWishlisted) {
                increment();
            } else {
                decrement();
            }

            const result = await toggleWishlist(productId);

            if (result.requiresAuth) {
                // Revert if auth required (since we redirected)
                if (willBeWishlisted) decrement(); else increment();

                router.push("/login");
                return;
            }

            if (!result.success) {
                // Revert on failure
                if (willBeWishlisted) decrement(); else increment();
                toast.error("Wystąpił błąd");
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "group/btn transition-all duration-300 hover:scale-110 active:scale-95",
                className
            )}
            disabled={isPending}
            aria-label={optimisticIsWishlisted ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
            <Heart
                size={22}
                className={cn(
                    "transition-colors duration-300",
                    optimisticIsWishlisted
                        ? "fill-red-600 text-red-600"
                        : "text-white group-hover/btn:text-red-500"
                )}
            />
        </button>
    );
}
