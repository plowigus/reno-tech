"use client";
import { useState, useEffect } from "react";

export function Clock() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span>{currentTime}</span>;
}
