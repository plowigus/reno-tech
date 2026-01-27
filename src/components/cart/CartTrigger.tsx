"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartTriggerProps {
    className?: string;
}

export function CartTrigger({ className }: CartTriggerProps) {
    const { openCart, cartCount } = useCart();

    return (
        <button
            onClick={openCart}
            className={cn("relative group p-2 hover:bg-white/10 rounded-full transition-colors", className)}
        >
            <ShoppingBag className="text-white transition-colors group-hover:text-red-500" size={20} />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-black">
                    {cartCount > 99 ? "99+" : cartCount}
                </span>
            )}
        </button>
    );
}
