"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { InteractiveLogo } from "./Animation/InteractiveLogo";
import { motion, AnimatePresence } from "motion/react";

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function IntroOverlay() {
    const [showIntro, setShowIntro] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useIsomorphicLayoutEffect(() => {
        setIsMounted(true);
        const hasSeenIntro = sessionStorage.getItem("introSeen");

        if (hasSeenIntro) {
            setShowIntro(false);
        } else {
            sessionStorage.setItem("introSeen", "true");
            // Wyłącz overlay już po 1.1s (było 2.5s)
            const timer = setTimeout(() => {
                setShowIntro(false);
            }, 1100);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <AnimatePresence>
            {showIntro && isMounted && (
                <motion.div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // Zaczyna znikać po 0.8s
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        <InteractiveLogo />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}