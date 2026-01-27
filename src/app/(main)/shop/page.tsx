import { getProducts } from "@/app/actions/product-actions";
import { ProductCard } from "@/components/ProductCard";
import { Search, Filter, X } from "lucide-react";
import Link from "next/link";

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

const categories = [
  { name: "Wszystkie", value: "" },
  { name: "Elektronika", value: "Elektronika" },
  { name: "Klucze", value: "Klucze" },
  { name: "Programatory", value: "Programatory" },
  { name: "Akcesoria", value: "Akcesoria" },
  { name: "Usługi", value: "Usługi" },
  { name: "Odzież", value: "Odzież" },
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search, category } = await searchParams;
  const products = await getProducts({ search, category });

  const isFiltered = !!search || !!category;

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-4">
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
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Filter size={20} className="text-red-500" />
                Kategorie
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.value ? `/shop?category=${cat.value}` : "/shop"}
                    className={`block px-4 py-2 rounded-lg text-sm transition-colors ${(category === cat.value) || (!category && !cat.value)
                      ? "bg-red-600 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <form action="/shop" className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                {category && <input type="hidden" name="category" value={category} />}
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Szukaj produktów..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-600"
                />
              </form>

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

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
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
                {(search || category) && (
                  <Link
                    href="/shop"
                    className="inline-block mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Wyczyść filtry
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
