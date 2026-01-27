import { getWishlistItems } from "@/app/actions/wishlist-actions";
import { WishlistItemCard } from "@/components/dashboard/WishlistItemCard";
import { Heart } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
    const items = await getWishlistItems();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Lista Życzeń</h1>
                <p className="text-zinc-400">
                    Twoje zapisane produkty.
                </p>
            </div>

            {items.length > 0 ? (
                <div className="flex flex-col space-y-4">
                    {items.map((product) => (
                        <WishlistItemCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-6">
                        <Heart size={32} className="text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Twoja lista życzeń jest pusta</h3>
                    <p className="text-zinc-400 max-w-sm mx-auto mb-8">
                        Zapisz produkty na później, klikając ikonę serca na karcie produktu.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
                    >
                        Przeglądaj sklep
                    </Link>
                </div>
            )}
        </div>
    );
}
