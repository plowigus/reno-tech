"use client";

import { useState, useEffect } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getZipCode,
    getDetails,
} from "use-places-autocomplete";
import { Loader2, MapPin } from "lucide-react";
import Script from "next/script";

interface AddressData {
    street: string;
    city: string;
    postalCode: string;
    country: string;
}

interface AddressAutocompleteProps {
    defaultValue?: string;
    onAddressSelect: (address: AddressData) => void;
}

const libraries: ("places")[] = ["places"];

export default function AddressAutocomplete({
    defaultValue = "",
    onAddressSelect,
}: AddressAutocompleteProps) {
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here if needed (e.g. restrict to Poland) */
            componentRestrictions: { country: "pl" },
        },
        debounce: 300,
        defaultValue,
        initOnMount: scriptLoaded,
    });

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const result = results[0];

            // Extract details
            const addressComponents = result.address_components;
            let street = "";
            let streetNumber = "";
            let city = "";
            let postalCode = "";
            let country = "";

            addressComponents.forEach((component: any) => {
                const types = component.types;
                if (types.includes("route")) {
                    street = component.long_name;
                }
                if (types.includes("street_number")) {
                    streetNumber = component.long_name;
                }
                if (types.includes("locality") || types.includes("postal_town")) {
                    city = component.long_name;
                }
                if (types.includes("postal_code")) {
                    postalCode = component.long_name;
                }
                if (types.includes("country")) {
                    country = component.long_name;
                }
            });

            onAddressSelect({
                street: `${street} ${streetNumber}`.trim(),
                city,
                postalCode,
                country,
            });
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    return (
        <>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
                strategy="lazyOnload"
                onLoad={() => setScriptLoaded(true)}
            />

            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    name="street" // Keep name for form submission fallback if needed, but typically we rely on state in parent
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready && !scriptLoaded}
                    placeholder="Zacznij wpisywać adres..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
                    autoComplete="off"
                />

                {status === "OK" && (
                    <ul className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-h-60 overflow-auto">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <MapPin size={14} className="text-zinc-500 shrink-0" />
                                <span>{description}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
