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
            // ⚡ POPRAWKA: Wyłącz overlay po zakończeniu animacji (2.5s)
            const timer = setTimeout(() => {
                setShowIntro(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    // Jeśli showIntro jest false, AnimatePresence obsłuży animację wyjścia (exit)
    // a potem usunie komponent z DOM.

    return (
        <AnimatePresence>
            {showIntro && isMounted && (
                <motion.div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 1.9 }}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        <InteractiveLogo />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}