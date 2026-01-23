"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { InteractiveLogo } from "./Animation/InteractiveLogo";
import { motion, AnimatePresence } from "motion/react";

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function IntroOverlay() {
    // Domyślnie TRUE - zakładamy, że intro MA BYĆ widoczne, żeby przykryć "golą" stronę.
    // Dzięki temu nie ma "błysku" treści przed załadowaniem JS.
    const [showIntro, setShowIntro] = useState(true);

    useIsomorphicLayoutEffect(() => {
        // Sprawdzamy storage zaraz po załadowaniu JS
        const hasSeenIntro = sessionStorage.getItem("introSeen");

        if (hasSeenIntro) {
            // Jeśli użytkownik już tu był -> wyłączamy intro NATYCHMIAST.
            // Ponieważ używamy useLayoutEffect, powinno się to stać przed narysowaniem klatki,
            // co zminimalizuje mignięcie czerni.
            setShowIntro(false);
        } else {
            // Jeśli nowy użytkownik -> zapisujemy wizytę i odpalamy timer
            sessionStorage.setItem("introSeen", "true");

            // Timer dostosowany do Twojej animacji (delay 0.4 + duration 0.4 = 0.8s wizualnie)
            // Dajemy mały zapas (1.2s), żeby animacja wyjścia zdążyła się odegrać.
            const timer = setTimeout(() => {
                setShowIntro(false);
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <AnimatePresence>
            {showIntro && (
                <motion.div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black"
                    // initial={{ opacity: 1 }} sprawia, że jest czarno od pierwszej milisekundy
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // Twoje ustawienia:
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