"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

const words = [
  "Programowanie Sterowników",
  "Nawigacje i Multimedia",
  "Karty Hands Free",
  "Diagnostyka Elektryki",
  "Chip Tuning",
  "Doposażenie Akcesoriami",
];

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

export function MatrixText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(words[0]);
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsScrambling(true);

      // Scramble effect
      let iterations = 0;
      const scrambleInterval = setInterval(() => {
        const nextWord = words[(currentIndex + 1) % words.length];

        setDisplayText(() =>
          nextWord
            .split("")
            .map((char, index) => {
              if (index < iterations) {
                return nextWord[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join(""),
        );

        iterations += 1 / 3;

        if (iterations >= nextWord.length) {
          clearInterval(scrambleInterval);
          setDisplayText(nextWord);
          setIsScrambling(false);
          setCurrentIndex((prev) => (prev + 1) % words.length);
        }
      }, 30);

      return () => clearInterval(scrambleInterval);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <motion.span
      className="inline-block text-red-700 font-mono w-full text-center"
      animate={isScrambling ? { opacity: [1, 0.7, 1] } : {}}
      transition={{ duration: 0.1, repeat: isScrambling ? Infinity : 0 }}
    >
      {displayText}
    </motion.span>
  );
}
