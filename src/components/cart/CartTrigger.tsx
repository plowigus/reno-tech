"use client";
import { forwardRef, useEffect, useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";

export const CartTrigger = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const items = useCartStore((state) => state.items);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const count = mounted ? items?.length || 0 : 0;

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn("relative rounded-full hover:bg-zinc-800 transition-colors", props.className)}
            {...props}
        >
            <ShoppingBag className="w-6 h-6 text-white" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-black">
                    {count}
                </span>
            )}
            <span className="sr-only">Otwórz koszyk</span>
        </Button>
    );
});
CartTrigger.displayName = "CartTrigger";