"use client";

import { motion } from "motion/react";
import React, { useState, useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function HeroContent({ children }: { children: React.ReactNode }) {
    // ⚡ ZMIANA: Domyślnie TRUE (zakładamy, że trzeba animować/ukryć), żeby nie było flasha
    const [shouldAnimate, setShouldAnimate] = useState(true);

    useIsomorphicLayoutEffect(() => {
        const flag = sessionStorage.getItem("introSeen");

        if (flag) {
            // Jeśli widział intro -> wyłączamy animację (pokaż natychmiast)
            setShouldAnimate(false);
        } else {
            // Jeśli nie widział -> zostawiamy true (animuj wejście)
            setShouldAnimate(true);
        }
    }, []);

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut" as const,
                delay: 1.5
            }
        },
        instant: {
            opacity: 1,
            y: 0,
            transition: { duration: 0 }
        }
    };

    return (
        <motion.div
            // Jeśli shouldAnimate=true (start), to "hidden" (opacity 0) - brak flasha
            initial={shouldAnimate ? "hidden" : "instant"}
            animate={shouldAnimate ? "visible" : "instant"}
            variants={variants}
            className="relative z-10 p-8 md:p-16 w-full max-w-5xl flex flex-col items-center justify-center"
        >
            {children}
        </motion.div>
    );
}