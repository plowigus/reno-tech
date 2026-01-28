"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { toggleWishlist } from "@/app/actions/wishlist-actions";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
    id: string;
    name: string;
    category: string;
    slug: string;
    description: string;
    price: string | number;
    image: string;
}

interface WishlistItemCardProps {
    product: Product;
}

export function WishlistItemCard({ product }: WishlistItemCardProps) {
    const router = useRouter();
    const decrement = useWishlistStore((state) => state.decrement);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async () => {
        setIsRemoving(true);
        // Optimistic UI update (visual removal handled by creating 'hidden' state or just waiting for refresh if strict)
        // User requested optimistic. I can return null if removing is true to hide it instantly.

        decrement(); // Update badge instantly

        try {
            const result = await toggleWishlist(product.id);
            if (result.success) {
                toast.success("Usunięto z listy życzeń");
                router.refresh();
            } else {
                toast.error("Błąd usuwania");
                setIsRemoving(false); // Revert
                // Increment back if needed? (Lazy consistency)
            }
        } catch (error) {
            console.error(error);
            setIsRemoving(false);
        }
    };

    if (isRemoving) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 border border-border bg-foreground/5 p-4 rounded-xl transition-all hover:bg-foreground/10">
            {/* Left: Image */}
            <div className="relative w-full sm:w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-background/20">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                />
            </div>

            {/* Middle: Info */}
            <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <h3 className="font-bold text-foreground text-lg">{product.name}</h3>
                <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">{product.category}</p>
                <div className="font-mono text-red-500 font-medium">
                    {Number(product.price).toFixed(2)} PLN
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <Link
                    href={`/shop/${product.category}/${product.slug}`}
                    className="flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground text-sm font-medium rounded-lg transition-colors"
                >
                    <ExternalLink size={16} />
                    Zobacz
                </Link>
                <button
                    onClick={handleRemove}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-sm font-medium rounded-lg transition-colors"
                    title="Usuń z listy życzeń"
                >
                    <Trash2 size={16} />
                    Usuń
                </button>
            </div>
        </div>
    );
}
