"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validators/product-schema";
import { createProduct } from "@/app/actions/product-actions";
import { UploadDropzone } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, X, Plus, DollarSign, Layers, AlignLeft } from "lucide-react";
import { clsx } from "clsx";

export function ProductForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [error, setError] = useState<string | undefined>("");

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            category: "",
            description: "",
            price: 0,
            images: [],
            sizes: [],
        },
    });

    const categories = [
        "Elektronika",
        "Klucze",
        "Programatory",
        "Akcesoria",
        "Usługi",
    ];

    function onSubmit(data: ProductFormValues) {
        setError("");
        startTransition(async () => {
            const result = await createProduct(data);
            if (result.success) {
                router.push("/dashboard/admin/products");
            } else {
                setError(result.error);
            }
        });
    }

    // use watch to get reactive updates
    const images = form.watch("images") || [];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Dodaj nowy produkt</h1>
                <p className="text-zinc-400">
                    Wypełnij formularz, aby dodać nowy produkt do sklepu.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    Nazwa produktu
                                </label>
                                <input
                                    {...form.register("name")}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                    placeholder="np. Karta Renault Laguna II"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <AlignLeft size={16} /> Opis
                                </label>
                                <textarea
                                    {...form.register("description")}
                                    className="w-full min-h-[150px] bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-y"
                                    placeholder="Szczegółowy opis produktu..."
                                />
                                {form.formState.errors.description && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Images */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                            <label className="text-sm font-medium text-zinc-300">Zdjęcia</label>

                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {images.map((url, index) => (
                                        <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800">
                                            <Image
                                                src={url}
                                                alt={`Product image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = images.filter((_, i) => i !== index);
                                                    form.setValue("images", newImages);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 rounded-full text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {images.length < 4 && (
                                <UploadDropzone
                                    endpoint="productImages"
                                    onClientUploadComplete={(res: { url: string }[]) => {
                                        if (res && res.length > 0) {
                                            const newImages = res.map((r) => r.url);
                                            // Append new images to existing ones (up to logic handled by user/max files, but UI hides dropzone if fully matched)
                                            // Better safety: spread the new URLs
                                            form.setValue("images", [...images, ...newImages]);
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        alert(`ERROR! ${error.message}`);
                                    }}
                                    className="ut-label:text-zinc-400 ut-allowed-content:text-zinc-500 border-zinc-700 bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors"
                                />
                            )}
                            {form.formState.errors.images && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.images.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                            {/* Price */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <DollarSign size={16} /> Cena (PLN)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    // Zod coercion handles number conversion
                                    {...form.register("price")}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                                {form.formState.errors.price && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.price.message}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Layers size={16} /> Kategoria
                                </label>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <label
                                            key={cat}
                                            className={clsx(
                                                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                form.watch("category") === cat
                                                    ? "bg-red-600/10 border-red-600/50"
                                                    : "bg-zinc-800/30 border-zinc-700 hover:bg-zinc-800"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                value={cat}
                                                {...form.register("category")}
                                                className="hidden"
                                            />
                                            <div className={clsx(
                                                "w-4 h-4 rounded-full border flex items-center justify-center",
                                                form.watch("category") === cat
                                                    ? "border-red-600"
                                                    : "border-zinc-500"
                                            )}>
                                                {form.watch("category") === cat && (
                                                    <div className="w-2 h-2 rounded-full bg-red-600" />
                                                )}
                                            </div>
                                            <span className={clsx(
                                                "text-sm font-medium",
                                                form.watch("category") === cat ? "text-red-500" : "text-zinc-300"
                                            )}>
                                                {cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {form.formState.errors.category && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.category.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Dodawanie...
                                </>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Dodaj produkt
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}