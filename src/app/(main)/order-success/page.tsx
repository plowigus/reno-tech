"use client";

import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const isMock = searchParams.get("mock") === "true";
    const sessionId = searchParams.get("session");

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 pt-20">
            <div className="bg-green-500/10 p-6 rounded-full mb-8 animate-in zoom-in duration-500">
                <CheckCircle size={64} className="text-green-500" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Dziękujemy za zamówienie!
            </h1>

            <p className="text-zinc-400 text-lg max-w-md mb-8">
                Twoje zamówienie zostało przyjęte do realizacji.
                {isMock && (
                    <span className="block mt-2 text-yellow-500 font-medium">
                        (To jest symulacja płatności P24)
                    </span>
                )}
                {sessionId && (
                    <span className="block mt-2 text-xs text-zinc-600 font-mono">
                        ID: {sessionId}
                    </span>
                )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Link
                    href="/shop"
                    className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wide"
                >
                    <ShoppingBag size={20} />
                    Wróć do sklepu
                </Link>
                <Link
                    href="/dashboard" /* Changed to generic dashboard as specific orders page might not distinguish user cleanly yet */
                    className="flex-1 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wide"
                >
                    Moje konto
                    <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}
