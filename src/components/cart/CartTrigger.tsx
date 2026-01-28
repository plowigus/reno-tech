"use client";

import { useCartStore } from "@/store/use-cart-store";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

interface CartTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    count?: number;
}

export const CartTrigger = forwardRef<HTMLButtonElement, CartTriggerProps>(({ className, count = 0, onClick, ...props }, ref) => {
    const onOpen = useCartStore((state) => state.onOpen);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpen();
        onClick?.(e);
    };

    return (
        <Button
            ref={ref}
            onClick={handleClick}
            variant="ghost"
            size="icon"
            className={cn("relative rounded-full hover:bg-white/10", className)}
            {...props}
        >
            <ShoppingBag className="text-white transition-colors group-hover:text-red-500" size={20} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-black">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Button>
    );
});

CartTrigger.displayName = "CartTrigger";
