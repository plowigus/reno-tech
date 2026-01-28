"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, MapPin } from "lucide-react";
import { getPlaceSuggestions, getPlaceDetails, type PlaceSuggestion, type AddressComponents } from "@/app/actions/google-maps-actions";
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
    defaultValue?: string;
    onAddressSelect: (address: AddressComponents) => void;
}

export default function AddressAutocomplete({
    defaultValue = "",
    onAddressSelect,
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Ref for debounce timeout
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    // Ref to track if click is inside component for closing dropdown
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Click outside handler
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        // Set new timeout (debounce 300ms)
        debounceRef.current = setTimeout(async () => {
            const results = await getPlaceSuggestions(value);
            setSuggestions(results);
            setIsLoading(false);
            setShowSuggestions(true);
        }, 300);
    };

    const handleSelect = async (placeId: string, description: string) => {
        setQuery(description);
        setShowSuggestions(false);
        setIsLoading(true);

        const details = await getPlaceDetails(placeId);
        setIsLoading(false);

        if (details) {
            setQuery(details.street);
            onAddressSelect(details);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
                name="street"
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Zacznij wpisywać adres..."
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-red-600 focus:ring-red-600"
                autoComplete="off"
            />

            {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-zinc-500 w-4 h-4" />
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-secondary border border-border rounded-lg shadow-xl max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.id}
                            onClick={() => handleSelect(suggestion.id, suggestion.description)}
                            className="px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <MapPin size={14} className="text-zinc-500 shrink-0" />
                            <span>{suggestion.description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
