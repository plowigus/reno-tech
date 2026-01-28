"use client";

import React, { useEffect, useRef, useState } from "react";

export const Ripple = () => {
    const [ripples, setRipples] = useState<{ x: number; y: number; size: number; key: number }[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = ref.current?.parentElement;
        if (!container) return;

        const handleMouseDown = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const size = Math.max(rect.width, rect.height);
            const key = Date.now();

            setRipples((prev) => [...prev, { x, y, size, key }]);
        };

        container.addEventListener("mousedown", handleMouseDown);
        return () => container.removeEventListener("mousedown", handleMouseDown);
    }, []);

    useEffect(() => {
        if (ripples.length > 0) {
            const timeout = setTimeout(() => {
                setRipples((prev) => prev.slice(1));
            }, 600); // Match animation duration
            return () => clearTimeout(timeout);
        }
    }, [ripples]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
            {ripples.map((ripple) => (
                <span
                    key={ripple.key}
                    className="absolute bg-white/30 rounded-full animate-ripple"
                    style={{
                        top: ripple.y - ripple.size / 2,
                        left: ripple.x - ripple.size / 2,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                />
            ))}
        </div>
    );
};
