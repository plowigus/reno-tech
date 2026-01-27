import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Plus, Package, Pencil } from "lucide-react";

export default async function ProductsPage() {
    const allProducts = await db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Produkty</h1>
                    <p className="text-zinc-400 mt-1">
                        Zarządzaj asortymentem sklepu ({allProducts.length})
                    </p>
                </div>
                <Link
                    href="/dashboard/admin/products/new"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
                >
                    <Plus size={18} />
                    Dodaj nowy
                </Link>
            </div>

            {allProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 rounded-2xl bg-zinc-900/30">
                    <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                        <Package className="text-zinc-500" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">Brak produktów</h3>
                    <p className="text-zinc-500 text-sm">
                        Nie dodałeś jeszcze żadnych produktów do sklepu.
                    </p>
                </div>
            ) : (
                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Produkt</th>
                                    <th className="px-6 py-4">Kategoria</th>
                                    <th className="px-6 py-4">Cena</th>
                                    <th className="px-6 py-4 text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {allProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-zinc-900/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 font-mono">
                                                        {product.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-zinc-200 font-medium">
                                                {product.price} PLN
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/admin/products/${product.id}/edit`}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
