import { Suspense } from "react";
import { getProducts } from "@/app/actions/product-actions";
import { ProductCard } from "@/components/ProductCard";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { ShopSearch } from "@/components/shop/ShopSearch";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { ProductGridSkeleton } from "@/components/shop/ProductGridSkeleton";

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

import { getUserWishlistIds } from "@/app/actions/wishlist-actions";

async function ProductGrid({ search, category }: { search?: string, category?: string }) {
  const products = await getProducts({ search, category });
  const wishlistIds = await getUserWishlistIds();
  const isFiltered = !!search || !!category;

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-6">
          <Search size={32} className="text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Brak produktów</h3>
        <p className="text-zinc-400 max-w-sm mx-auto">
          {search
            ? `Brak wyników wyszukiwania dla: "${search}"`
            : category
              ? `Nie znaleziono produktów w kategorii: ${category}`
              : "Nie znaleziono produktów spełniających Twoje kryteria."}
        </p>
        {isFiltered && (
          <Link
            href="/shop"
            className="inline-block mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Wyczyść filtry
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistIds.includes(product.id)}
        />
      ))}
    </div>
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search, category } = await searchParams;
  const isFiltered = !!search || !!category;

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Sklep <span className="text-red-600">Renotech</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Oficjalne gadżety i akcesoria dla fanów marki.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-8 shrink-0">
            <CategoryFilter />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <ShopSearch />

              {isFiltered && (
                <Link
                  href="/shop"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  <X size={16} />
                  Wyczyść filtry
                </Link>
              )}
            </div>

            {/* Product Grid with Suspense */}
            <Suspense key={`${search}-${category}`} fallback={<ProductGridSkeleton />}>
              <ProductGrid search={search} category={category} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
