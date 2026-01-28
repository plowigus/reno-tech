"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ... previous imports
import { AddToCartButton } from "./cart/AddToCartButton";
import { Button } from "@/components/ui/button";

interface Product {
    id: string;
    name: string;
    category: string;
    slug: string;
    description: string;
    price: string | number;
    image: string;
    images: string[];
    sizes: string[] | null;
}

interface ProductDetailsProps {
    product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
    const [selectedImage, setSelectedImage] = useState(product.images[0] || product.image);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);

    return (
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[600px]">
            {/* Left: Interactive Gallery (Sticky) */}
            <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 h-fit lg:sticky lg:top-32 self-start mb-20">
                {/* Thumbnails (Vertical on Desktop, Horizontal/Below on Mobile) */}
                {product.images.length > 1 && (
                    <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible lg:w-24 shrink-0 pb-2 lg:pb-0 scrollbar-hide max-h-[calc(100vh-10rem)] overflow-y-auto">
                        {product.images.slice(0, 5).map((img, idx) => (
                            <Button
                                key={idx}
                                variant="ghost"
                                onClick={() => setSelectedImage(img)}
                                className={cn(
                                    "relative aspect-3/4 w-20 lg:w-full rounded-lg overflow-hidden border transition-all duration-300 shrink-0 p-0 h-auto hover:bg-transparent",
                                    selectedImage === img
                                        ? "border-red-600 opacity-100 ring-2 ring-red-600/30"
                                        : "border-border opacity-50 hover:opacity-100 hover:border-white/30"
                                )}
                            >
                                <Image
                                    src={img}
                                    alt={`${product.name} thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="100px"
                                />
                            </Button>
                        ))}
                    </div>
                )}

                {/* Main Image */}
                <div className="relative flex-1 aspect-square bg-foreground/5 border border-border rounded-2xl overflow-hidden group">
                    <Image
                        src={selectedImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-500"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-5 flex flex-col h-full">
                <div className="pt-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-red-500 font-bold tracking-widest uppercase mb-2 block text-xs">
                                {product.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-none">
                                {product.name}
                            </h1>
                        </div>
                        {/* Wishlist Icon placeholder if needed */}
                    </div>

                    <div className="text-2xl font-mono text-foreground mb-8 flex items-center gap-4">
                        <span>{Number(product.price).toFixed(2)} PLN</span>
                        <span className="text-sm text-gray-500 font-sans">w tym VAT</span>
                    </div>

                    <p className="text-gray-400 text-base leading-relaxed mb-10 border-l-2 border-red-600/30 pl-4">
                        {product.description}
                    </p>

                    {/* Size Selector */}
                    <div className="mb-8">
                        {product.sizes && product.sizes.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-200">Rozmiar</span>
                                    <span className="text-gray-500 underline cursor-pointer hover:text-white">Tabela rozmiarów</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {product.sizes.map((size) => (
                                        <Button
                                            key={size}
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedSize(size);
                                                setShowError(false);
                                            }}
                                            className={cn(
                                                "h-12 rounded-md font-bold text-sm flex items-center justify-center transition-all duration-200 border w-full",
                                                selectedSize === size
                                                    ? "bg-white text-black border-white hover:bg-white/90 hover:text-black"
                                                    : showError
                                                        ? "bg-transparent border-red-500 text-red-500 hover:border-red-400 hover:bg-red-500/10 hover:text-red-500"
                                                        : "bg-transparent border-white/20 text-gray-400 hover:border-white hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {size}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-300 font-medium flex items-center gap-2 bg-foreground/5 border border-border px-4 py-3 rounded-lg w-full">
                                <Check size={16} className="text-red-500" />
                                <span>Rozmiar Uniwersalny</span>
                            </div>
                        )}
                    </div>



                    {/* Actions */}
                    <div className="flex gap-4 mb-8">
                        <AddToCartButton
                            productId={product.id}
                            selectedSize={selectedSize}
                            onValidate={() => {
                                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                                    setShowError(true);
                                    toast.error("Proszę wybrać rozmiar!");
                                    return false;
                                }
                                setShowError(false);
                                return true;
                            }}
                            showText={true}
                            iconSize={20}
                        />
                    </div>

                    {/* Info Blocks */}
                    <div className="border border-border rounded-xl divide-y divide-border">
                        <div className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-full">
                                <Check size={20} className="text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Darmowa dostawa</p>
                                <p className="text-xs text-gray-400">Dla zamówień powyżej 200 PLN</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-full">
                                <ArrowLeft size={20} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Bezproblemowy zwrot towaru</p>
                                <p className="text-xs text-gray-400">Darmowa zwrot towaru</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mt-8 group text-sm"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Powrót do sklepu
                    </Link>
                </div>
            </div>
        </div >
    );
}
