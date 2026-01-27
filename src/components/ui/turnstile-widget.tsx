"use client";

import Turnstile from "react-turnstile";

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    return (
        <div className="w-full flex justify-center my-4">
            <Turnstile
                sitekey={siteKey}
                onVerify={onVerify}
                theme="dark"
            />
        </div>
    );
}
