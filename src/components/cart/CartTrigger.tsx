"use client";

import { useCartStore } from "@/store/use-cart-store";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartTriggerProps {
    className?: string;
    count?: number;
}

export function CartTrigger({ className, count = 0 }: CartTriggerProps) {
    const onOpen = useCartStore((state) => state.onOpen);

    return (
        <button
            onClick={onOpen}
            className={cn("relative group p-2 hover:bg-white/10 rounded-full transition-colors", className)}
        >
            <ShoppingBag className="text-white transition-colors group-hover:text-red-500" size={20} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-black">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </button>
    );
}
