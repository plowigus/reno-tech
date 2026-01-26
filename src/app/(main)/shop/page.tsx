import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Sklep <span className="text-red-600">Renotech</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Oficjalne gadżety i akcesoria dla fanów marki.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
