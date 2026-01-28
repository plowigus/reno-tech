import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

export const CartTrigger = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const items = useCartStore((state) => state.items);
    const isMounted = useMounted();

    const itemCount = isMounted ? items.length : 0;

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn("relative rounded-full hover:bg-zinc-800 transition-colors", props.className)}
            {...props}
        >
            <ShoppingBag className="w-6 h-6 text-white" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-black">
                    {itemCount}
                </span>
            )}
            <span className="sr-only">Otwórz koszyk</span>
        </Button>
    );
});

CartTrigger.displayName = "CartTrigger";