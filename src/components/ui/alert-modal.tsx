"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    title: string;
    description: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
    title,
    description,
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isMounted) {
        return null;
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
                onClick={loading ? undefined : onClose}
            />

            {/* Dialog */}
            <div className="relative z-50 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 slide-in-from-bottom-2">
                <div className="mb-4 text-left">
                    <h2 className="text-lg font-semibold text-white">
                        {title}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-2">
                        {description}
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2 w-full pt-4">
                    <button
                        disabled={loading}
                        onClick={onClose}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-700",
                            "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        Anuluj
                    </button>
                    <button
                        disabled={loading}
                        onClick={onConfirm}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                            "bg-red-600 hover:bg-red-700 text-white",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Kontynuuj
                    </button>
                </div>
            </div>
        </div>
    );
};
