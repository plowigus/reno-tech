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
    // Load script only if not present
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
        appearance: "interaction-only",
        theme: "dark",
      });
      widgetId.current = id;
    }
  }, [scriptLoaded, onVerify]);

  return (
    <div
      ref={containerRef}
      className={cn("flex justify-center items-center w-full", className)}
    />
  );
});

TurnstileWidget.displayName = "TurnstileWidget";
