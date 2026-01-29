"use client";

import Turnstile from "react-turnstile";
import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

export interface TurnstileRef {
  reset: () => void;
}

export const TurnstileWidget = forwardRef<TurnstileRef, TurnstileWidgetProps>(
  ({ onVerify, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      // Store the widget ID when rendered
      const handleVerify = (token: string) => {
        onVerify(token);
      };

      const handleError = () => {
        if (onError) onError();
      };

      const handleExpire = () => {
        if (onError) onError();
      };

      // Render Turnstile and capture the widget ID
      const widgetId = (window as any).turnstile?.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: handleVerify,
        "error-callback": handleError,
        "expired-callback": handleExpire,
      });

      widgetIdRef.current = widgetId;

      return () => {
        // Cleanup if needed
        if (widgetIdRef.current && (window as any).turnstile?.remove) {
          (window as any).turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [onVerify, onError, siteKey]);

    return (
      // 1. Kontener na cały ekran, ale przepuszcza kliknięcia (pointer-events-none)
      // Dzięki temu, gdy widget jest ukryty, nie blokuje formularza.
      <div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none">
        {/* 2. Sam widget przechwytuje kliknięcia (pointer-events-auto), jeśli się pojawi */}
        <div className="pointer-events-auto">
          <div ref={containerRef} className="my-4" />
        </div>
      </div>
    );
  },
);

TurnstileWidget.displayName = "TurnstileWidget";
