"use client";


import { useSearchParams, useRouter } from "next/navigation";
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "";

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Filter size={20} className="text-red-500" />
                Kategorie
            </h3>
            <div className="space-y-2">
                {categories.map((cat) => {
                    const valueLower = cat.value.toLowerCase();
                    const isActive = currentCategory.toLowerCase() === valueLower;

                    return (
                        <button
                            key={cat.name}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                if (cat.value) {
                                    params.set("category", valueLower);
                                } else {
                                    params.delete("category");
                                }
                                router.replace(`/shop?${params.toString()}`, { scroll: false });
                            }}
                            className={cn(
                                "block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
                                isActive
                                    ? "bg-red-600 text-white font-medium"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            )}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
