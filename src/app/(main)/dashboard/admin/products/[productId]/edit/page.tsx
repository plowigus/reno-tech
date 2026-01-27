import { getProductById } from "@/app/actions/product-actions";
import { ProductForm } from "@/components/dashboard/products/ProductForm";
import { notFound } from "next/navigation";

interface EditProductPageProps {
    params: Promise<{
        productId: string;
    }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { productId } = await params;

    const product = await getProductById(productId);

    if (!product) {
        notFound();
    }

    return <ProductForm initialData={product} />;
}
