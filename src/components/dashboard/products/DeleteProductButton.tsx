"use client";

import { deleteProduct } from "@/app/actions/product-actions";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/ui/alert-modal";

interface DeleteProductButtonProps {
    id: string;
}

export function DeleteProductButton({ id }: DeleteProductButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteProduct(id);

            if (result.success) {
                toast.success("Produkt został usunięty");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Wystąpił błąd podczas usuwania produktu");
            }
        });
    };

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={handleDelete}
                loading={isPending}
                title="Czy na pewno chcesz usunąć ten produkt?"
                description="Tej operacji nie można cofnąć. Produkt zostanie trwale usunięty ze sklepu."
            />
            <button
                onClick={() => setOpen(true)}
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
        </>
    );
}
