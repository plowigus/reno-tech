"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";

interface TurnstileProps {
  onVerify: (token: string) => void;
  className?: string;
}

export interface TurnstileRef {
  reset: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "refresh-expired"?: "auto" | "manual" | "never";
          appearance?: "always" | "execute" | "interaction-only";
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget = forwardRef<TurnstileRef, TurnstileProps>(({ onVerify, className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current);
      }
    },
  }));

  useEffect(() => {
    if (!document.getElementById("turnstile-script")) {
      const script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && containerRef.current && !widgetId.current && window.turnstile) {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        callback: (token: string) => onVerify(token),
        "refresh-expired": "auto",
        appearance: "always",
        theme: "dark",
        // 'flexible' might help, but our CSS override is the ultimate enforcer
        size: "flexible",
      });
      widgetId.current = id;
    }
  }, [scriptLoaded, onVerify]);

  return (
    <div
      ref={containerRef}
      // CRITICAL: [&_iframe] targets the iframe inside. 
      // !w-full and !h-full override Cloudflare's inline styles.
      className={cn(
        "flex justify-center items-center w-full h-full",
        "[&_iframe]:!w-full [&_iframe]:!h-full",
        className
      )}
    />
  );
});

TurnstileWidget.displayName = "TurnstileWidget";
