"use client";

import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { addToCart } from "@/app/actions/cart-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface AddToCartButtonProps extends ButtonProps {
    productId: string;
    iconSize?: number;
    showText?: boolean;
    valsize?: string | null;
    selectedSize?: string | null;
    onValidate?: () => boolean;
}

export function AddToCartButton({
    productId,
    className,
    iconSize = 20,
    showText = false,
    selectedSize = null,
    size,
    onValidate,
    ...props
}: AddToCartButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const onOpen = useCartStore((state) => state.onOpen);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product page if button is inside a Link
        e.stopPropagation();

        if (onValidate && !onValidate()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await addToCart(productId, 1, selectedSize);

            if (result.requiresAuth) {
                // Set Intent Cookie
                const intent = JSON.stringify({
                    type: "cart",
                    productId,
                    quantity: 1,
                    size: selectedSize // Save size in intent as well
                });
                document.cookie = `cart_intent=${encodeURIComponent(intent)}; path=/; max-age=3600`;

                toast.info("Zaloguj się, aby dodać do koszyka");
                router.push("/login");
                return;
            }

            if (result.success) {
                toast.success("Dodano do koszyka");
                onOpen();
            } else {
                toast.error(result.error || "Wystąpił błąd");
            }
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleAddToCart}
            disabled={isLoading || props.disabled}
            variant={props.variant || "ghost"}
            size={size}
            className={cn(
                showText
                    ? "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden shadow h-auto px-4 w-full text-center bg-white text-black font-bold py-6 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-wide"
                    : "flex items-center justify-center transition-all duration-300 hover:bg-transparent group relative overflow-hidden",
                className
            )}
            {...props}
        >
            {isLoading ? (
                <Loader2 size={iconSize} className="animate-spin text-white" />
            ) : (
                <>
                    <ShoppingBag size={iconSize} />
                    {showText && <span className="ml-2">Dodaj do koszyka</span>}
                </>
            )}
        </Button>
    );
}
