"use client";

import { motion } from "motion/react";
import React, { useState, useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function HeroContent({ children }: { children: React.ReactNode }) {
    const [shouldAnimate, setShouldAnimate] = useState(true);

    useIsomorphicLayoutEffect(() => {
        const flag = sessionStorage.getItem("introSeen");

        if (flag) {
            setShouldAnimate(false);
        } else {
            setShouldAnimate(true);
        }
    }, []);

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5, // Krótszy czas wjazdu (było 0.8s)
                ease: "easeOut" as const,
                delay: 0.6 // Wjeżdża, gdy logo już zaczyna znikać (było 1.5s)
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
            initial={shouldAnimate ? "hidden" : "instant"}
            animate={shouldAnimate ? "visible" : "instant"}
            variants={variants}
            className="relative z-10 p-8 md:p-16 w-full max-w-5xl flex flex-col items-center justify-center"
        >
            {children}
        </motion.div>
    );
}