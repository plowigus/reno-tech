"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        // Clear the cart immediately upon successful navigation to this page
        clearCart();
    }, [clearCart]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2">
                Dziękujemy za zamówienie!
            </h1>
            <p className="text-zinc-400 max-w-md mb-8">
                Twoje zamówienie zostało przyjęte do realizacji. Wysłaliśmy potwierdzenie na Twój adres email.
            </p>

            <div className="flex gap-4">
                <Button asChild variant="outline" className="border-zinc-800 hover:bg-zinc-900 text-white">
                    <Link href="/dashboard/orders">Moje zamówienia</Link>
                </Button>
                <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                    <Link href="/shop">Wróć do sklepu</Link>
                </Button>
            </div>
        </div>
    );
}
