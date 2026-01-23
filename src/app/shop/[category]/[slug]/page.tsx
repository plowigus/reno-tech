import { products } from "@/data/products";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";

interface PageProps {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return products.map((product) => ({
        category: product.category,
        slug: product.slug,
    }));
}

export default async function ProductPage({ params }: PageProps) {
    const { category, slug } = await params;
    const product = products.find(
        (p) => p.slug === slug && p.category === category
    );

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-20 px-4 flex items-center justify-center">
            <ProductDetails product={product} />
        </main>
    );
}

