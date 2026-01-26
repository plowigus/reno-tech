"use server";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

if (!GOOGLE_API_KEY) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_KEY environment variable");
}

export type PlaceSuggestion = {
    id: string;
    description: string;
};

export type AddressComponents = {
    street: string;
    city: string;
    postalCode: string;
    country: string;
};

export async function getPlaceSuggestions(input: string): Promise<PlaceSuggestion[]> {
    if (!input || input.length < 3) return [];

    try {
        const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY!,
            },
            body: JSON.stringify({
                input,
                includedPrimaryTypes: ["street_address", "route"],
                languageCode: "pl",
            }),
        });

        if (!response.ok) {
            console.error("Google Places Autocomplete Error:", await response.text());
            return [];
        }

        const data = await response.json();

        // Map the new API format to our structure
        // New API returns `suggestions` array with `placePrediction`
        return (data.suggestions || []).map((item: any) => ({
            id: item.placePrediction.placeId,
            description: item.placePrediction.text.text,
        }));

    } catch (error) {
        console.error("Server Action Error:", error);
        return [];
    }
}

export async function getPlaceDetails(placeId: string): Promise<AddressComponents | null> {
    try {
        // Field mask is critical for New Places API billing and function
        const fieldMask = "addressComponents";

        const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY!,
                "X-Goog-FieldMask": fieldMask,
                "Accept-Language": "pl"
            },
        });

        if (!response.ok) {
            console.error("Google Places Details Error:", await response.text());
            return null;
        }

        const data = await response.json();
        const components = data.addressComponents || [];

        let street = "";
        let streetNumber = "";
        let city = "";
        let postalCode = "";
        let country = "";

        // Parse address components
        components.forEach((component: any) => {
            const types = component.types;
            if (types.includes("route")) {
                street = component.longText || component.shortText;
            }
            if (types.includes("street_number")) {
                streetNumber = component.longText || component.shortText;
            }
            if (types.includes("locality") || types.includes("postal_town")) {
                city = component.longText || component.shortText;
            }
            if (types.includes("postal_code")) {
                postalCode = component.longText || component.shortText;
            }
            if (types.includes("country")) {
                country = component.longText || component.shortText;
            }
        });

        return {
            street: `${street} ${streetNumber}`.trim(),
            city,
            postalCode,
            country,
        };

    } catch (error) {
        console.error("Server Action Error:", error);
        return null;
    }
}
