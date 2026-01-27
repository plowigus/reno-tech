"use client";

import Turnstile from "react-turnstile";

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onError?: () => void;
}

export function TurnstileWidget({ onVerify, onError }: TurnstileWidgetProps) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    return (
        // 1. Kontener na cały ekran, ale przepuszcza kliknięcia (pointer-events-none)
        // Dzięki temu, gdy widget jest ukryty, nie blokuje formularza.
        <div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none">

            {/* 2. Sam widget przechwytuje kliknięcia (pointer-events-auto), jeśli się pojawi */}
            <div className="pointer-events-auto">
                <Turnstile
                    sitekey={siteKey}
                    onVerify={(token) => {
                        onVerify(token);
                    }}
                    onError={(error) => {

                        if (onError) onError();
                    }}
                    onExpire={() => {

                        if (onError) onError();
                    }}
                    theme="dark"
                />
            </div>
        </div>
    );
}