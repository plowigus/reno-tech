"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Smile } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Theme, EmojiStyle } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
    loading: () => <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
});

interface ChatInputProps {
    onSend: (content: string) => Promise<void>;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isSending || disabled) return;

        const content = inputValue;
        setInputValue(""); // Optimistic clear
        setIsSending(true);
        setShowEmoji(false); // Close emoji picker on send

        await onSend(content);

        setIsSending(false);
    };

    return (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm relative">
            {showEmoji && (
                <div className="absolute bottom-20 left-4 z-50 shadow-xl rounded-xl border border-zinc-800">
                    <EmojiPicker
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.APPLE}
                        previewConfig={{ showPreview: false }}
                        onEmojiClick={(data) => setInputValue((prev) => prev + data.emoji)}
                        lazyLoadEmojis={true}
                    />
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-yellow-400 mb-0.5"
                    onClick={() => setShowEmoji(!showEmoji)}
                >
                    <Smile className="w-6 h-6" />
                </Button>
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Napisz wiadomość..."
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-red-600"
                // autoFocus // Can be annoying on mobile or re-renders
                />
                <Button type="submit" disabled={isSending || disabled || !inputValue.trim()} size="icon" className="bg-red-600 hover:bg-red-700 text-white">
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </form>
        </div>
    );
}
