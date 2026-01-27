import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

interface Product {
    id: string;
    name: string;
    category: string;
    slug: string;
    description: string;
    price: string | number;
    image: string;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link
            href={`/shop/${product.category}/${product.slug}`}
            className="group relative block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/50 transition-colors duration-300"
        >
            <div className="aspect-4/5 w-full bg-black/50 relative flex items-center justify-center overflow-hidden">
                {/* Image */}
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />

                <AddToCartButton
                    productId={product.id}
                    className="absolute bottom-4 right-4 bg-red-600 p-3 rounded-full translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-700"
                />
            </div>

            <div className="p-5">
                <p className="text-red-500 text-xs font-bold tracking-wider uppercase mb-2">
                    {product.category}
                </p>
                <h3 className="text-white text-lg font-bold mb-2 group-hover:text-red-500 transition-colors">
                    {product.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {product.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-lg">
                        {Number(product.price).toFixed(2)} PLN
                    </span>
                </div>
            </div>
        </Link>
    );
}
