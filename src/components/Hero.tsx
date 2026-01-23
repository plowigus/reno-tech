"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { InteractiveLogo } from "./Animation/InteractiveLogo";
import { MatrixText } from "./Animation/MatrixText";
import { motion } from "motion/react";
import { Facebook, Instagram, Phone, ChevronDown } from "lucide-react";
import { Clock } from "./Clock";
import dynamic from "next/dynamic";

// Dynamiczny import komponentu FloatingLines
const FloatingLines = dynamic(() => import("./FloatingLines"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />,
});

// Bezpieczny hook dla SSR
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Hero() {
  const [showIntro, setShowIntro] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsMounted(true);
    const hasSeenIntro = sessionStorage.getItem("introSeen");
    if (hasSeenIntro) {
      setShowIntro(false);
    } else {
      sessionStorage.setItem("introSeen", "true");
    }
  }, []);

  // Logika czasów: 0 jeśli wracamy, normalne wartości jeśli pierwsze wejście
  const baseDelay = showIntro ? 1.5 : 0;
  const baseDuration = showIntro ? 0.5 : 0;

  // Funkcja generująca obiekt transition z poprawnymi typami dla Motion
  const getTransition = (delayOffset: number = 0, durationOverride: number = 0) => ({
    delay: showIntro ? baseDelay + delayOffset : 0,
    duration: showIntro ? (durationOverride || baseDuration) : 0,
    ease: "easeOut" as const, // "as const" naprawia błąd typu Easing
  });

  return (
    <section className="min-h-screen relative bg-black z-10 p-4 md:p-8 text-white">
      {isMounted && (
        <motion.div
          className="absolute inset-0 transform-gpu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={getTransition(0, 0.5)}
          style={{ willChange: "opacity" }}
        >
          <FloatingLines />
        </motion.div>
      )}

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-20 pointer-events-none">
        {showIntro && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-50">
            <InteractiveLogo />
          </div>
        )}

        <div className="relative z-10 p-8 md:p-16 w-full max-w-5xl flex flex-col items-center justify-center">
          <motion.div
            className="px-4 py-2 mb-2 text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition(0, 0.8)}
          >
            RENO<span className="text-red-700">tech.</span>
          </motion.div>
          <motion.div
            className="px-4 py-2 text-center text-lg md:text-2xl uppercase tracking-[0.2em] w-full flex justify-center font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition(0.1, 0.8)}
          >
            <MatrixText />
          </motion.div>
        </div>
      </div>

      <motion.footer
        className="absolute bottom-0 left-0 right-0 p-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={getTransition(0.2, 0.2)}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm relative">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center font-mono text-white text-base md:text-md tracking-wide">
              <Clock />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown size={24} className="text-white/50" />
            </motion.div>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="tel:+48123456789"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Phone size={20} />
            </a>
          </div>
        </div>
      </motion.footer>
    </section>
  );
}