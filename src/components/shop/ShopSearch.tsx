"use client";

import { useDebouncedCallback } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function ShopSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSearch = searchParams.get("search") || "";

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        router.replace(`/shop?${params.toString()}`, { scroll: false });
    }, 300);

    return (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
                type="text"
                defaultValue={currentSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Szukaj produktów..."
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-600"
            />
        </div>
    );
}
