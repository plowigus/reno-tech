"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/use-wishlist-store";

interface WishlistCounterSyncProps {
    initialCount: number;
}

export function WishlistCounterSync({ initialCount }: WishlistCounterSyncProps) {
    const setCount = useWishlistStore((state) => state.setCount);

    useEffect(() => {
        setCount(initialCount);
    }, [initialCount, setCount]);

    return null;
}
