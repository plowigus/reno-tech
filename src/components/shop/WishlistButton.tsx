import { useWishlistStore } from "@/store/use-wishlist-store";

// ... inside component ...
const { increment, decrement } = useWishlistStore(); // Simplified destructuring if allowed or state selector

// ... or ...
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
