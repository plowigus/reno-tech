"use client";
import { forwardRef, useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";

export const CartTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
    const items = useCartStore((state) => state.items);
    const onOpen = useCartStore((state) => state.onOpen);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const count = mounted ? items?.length || 0 : 0;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.onClick) {
            props.onClick(e);
        } else {
            onOpen();
        }
    };

    return (
        <button
            ref={ref}
            className={cn("group relative p-2 hover:bg-white/10 rounded-full transition-colors", props.className)}
            {...props}
            onClick={handleClick}
        >
            <ShoppingCart className="text-white transition-colors group-hover:text-red-500" size={20} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-foreground shadow-sm ring-2 ring-black">
                    {count > 99 ? "99+" : count}
                </span>
            )}
            <span className="sr-only">Otwórz koszyk</span>
        </button>
    );
});
CartTrigger.displayName = "CartTrigger";