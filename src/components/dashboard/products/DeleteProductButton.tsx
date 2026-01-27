"use client";

import { deleteProduct } from "@/app/actions/product-actions";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteProductButtonProps {
    id: string;
}

export function DeleteProductButton({ id }: DeleteProductButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = async () => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten produkt? Te operacja jest nieodwracalna.")) {
            return;
        }

        startTransition(async () => {
            const result = await deleteProduct(id);

            if (result.success) {
                toast.success("Produkt został usunięty");
                router.refresh(); // Ensure the list updates
            } else {
                toast.error(result.error || "Wystąpił błąd podczas usuwania produktu");
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Usuń produkt"
        >
            {isPending ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <Trash2 size={18} />
            )}
        </button>
    );
}
