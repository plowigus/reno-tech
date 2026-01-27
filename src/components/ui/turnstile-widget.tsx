"use client";

import Turnstile from "react-turnstile";

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    return (
        <div className="fixed bottom-0 hidden right-0 z-100">
            <Turnstile
                sitekey={siteKey}
                onVerify={onVerify}
            />
        </div>
    );
}