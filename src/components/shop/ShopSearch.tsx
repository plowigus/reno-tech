"use client";

import { useDebouncedCallback } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
            <Input
                type="text"
                defaultValue={currentSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Szukaj produktów..."
                className="bg-secondary border-border text-foreground rounded-xl py-3 pl-12 pr-4 focus:border-red-600 h-auto"
            />
        </div>
    );
}
