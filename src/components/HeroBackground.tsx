"use client";

import dynamic from "next/dynamic";
import { memo } from "react";

const FloatingLines = dynamic(() => import("./FloatingLines"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />,
});

export const HeroBackground = memo(function HeroBackground() {
    return (
        <div className="absolute inset-0 transform-gpu z-0">
            <FloatingLines />
        </div>
    );
});
