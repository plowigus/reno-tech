"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
    { name: "Wszystkie", value: "" },
    { name: "Elektronika", value: "Elektronika" },
    { name: "Klucze", value: "Klucze" },
    { name: "Programatory", value: "Programatory" },
    { name: "Akcesoria", value: "Akcesoria" },
    { name: "Usługi", value: "Usługi" },
    { name: "Odzież", value: "Odzież" },
];

export function CategoryFilter() {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "";

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Filter size={20} className="text-red-500" />
                Kategorie
            </h3>
            <div className="space-y-2">
                {categories.map((cat) => (
                    <Link
                        key={cat.name}
                        href={cat.value ? `/shop?category=${cat.value}` : "/shop"}
                        scroll={false}
                        className={cn(
                            "block px-4 py-2 rounded-lg text-sm transition-colors",
                            (currentCategory === cat.value)
                                ? "bg-red-600 text-white font-medium"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        )}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
