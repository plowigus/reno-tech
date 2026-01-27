"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/app/actions/wishlist-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startTransition(async () => {
            toggleOptimisticWishlist(!optimisticIsWishlisted);

            const result = await toggleWishlist(productId);

            if (result.requiresAuth) {
                // Determine logic for auth redirect if needed, currently prompting user
                // Could also redirect via router.push as requested
                router.push("/login");
                return;
            }

            // If server action fails, we might want to revert, but useOptimistic handles display.
            // Since we revalidatePath in action, the real state will sync on next refresh.
            if (!result.success) {
                // Silently failing or reverting logic?
                // For now, trusting optimistic UI + revalidation
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
