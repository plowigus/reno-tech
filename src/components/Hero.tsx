"use client";
import Navbar from "./Navbar";
import { InteractiveLogo } from "./Animation/InteractiveLogo";
import FloatingLines from "./FloatingLines";
import { MatrixText } from "./Animation/MatrixText";
import { motion } from "motion/react";
import { Facebook, Instagram, Phone, ChevronDown } from "lucide-react";
import { Clock } from "./Clock";

export function Hero() {
  return (
    <section className="min-h-screen relative bg-black z-10  p-4 md:p-8 text-white">
      <motion.div
        className="absolute inset-0 transform-gpu"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.4, duration: 0, ease: "easeOut" }}
        style={{ willChange: "opacity" }}
      >
        <FloatingLines
          linesGradient={["#B10B1A", "#440E03", "#9C2007"]}
          animationSpeed={1.8}
          interactive
          bendRadius={10}
          bendStrength={0.6}
          mouseDamping={0.08}
          parallax={false}
          parallaxStrength={0}
          lineCount={5}
          enabledWaves={["top", "bottom", "middle"]}
          lineDistance={30}
          middleWavePosition={{ x: 1, y: 1.1, rotate: -0.6 }}
          topWavePosition={{ x: 1.5, y: 1.8, rotate: -0.6 }}
          bottomWavePosition={{ x: 1.5, y: 1.8, rotate: -0.7 }}
        />
      </motion.div>
      <motion.div
        className="transform-gpu"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.6, duration: 0.2, ease: "easeOut" }}
        style={{ willChange: "opacity" }}
      >
        <Navbar />
      </motion.div>
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-200px)] flex flex-col justify-center items-center text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-2">
          <InteractiveLogo />
        </div>

        <div className=" p-8 md:p-16 mb-8 w-full max-w-4xl z-3 ">
          <motion.div
            className=" px-4 py-2 mb-1 text-4xl md:text-6xl lg:text-8xl font-bold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.0, duration: 0.6, ease: "easeOut" }}
          >
            RENO<span className="text-red-700">tech.</span>
          </motion.div>
          <motion.div
            className="px-4 py-2 text-center text-base md:text-2xl uppercase w-full flex justify-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 0.3, ease: "easeOut" }}
          >
            <MatrixText />
          </motion.div>
        </div>
      </div>
      <motion.footer
        className="absolute bottom-0 left-0 right-0 p-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.6, duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center p-4 text-sm relative">
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="hidden md:flex items-center font-mono text-white text-base md:text-md tracking-wide">
              <Clock />
            </div>
          </div>

          {/* Center - Scroll Down */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400">
            <span className="text-xs uppercase tracking-wider"></span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>

          {/* Right - Social Icons */}
          <div className="flex items-center gap-4 px-4 py-2">
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
              className="text-gray-400 hover:text-pink-500 transition-colors"
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
