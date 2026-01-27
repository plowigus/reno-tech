import { getProductBySlug } from "@/app/actions/product-actions";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";

interface PageProps {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-20 px-4 flex items-center justify-center">
            <ProductDetails product={product} />
        </main>
    );
}

