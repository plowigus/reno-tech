"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/use-wishlist-store";

export function WishlistButton() {
    const count = useWishlistStore((state) => state.count);

    return (
        <Link
            href="/dashboard/wishlist"
            className="group relative p-2 hover:bg-white/10 rounded-full transition-colors"
        >
            <Heart className="text-white transition-colors group-hover:text-red-500" size={20} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-foreground shadow-sm ring-2 ring-black">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}
