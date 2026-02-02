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
        <div className="p-4 bg-zinc-950 sticky bottom-0 z-10">
            <div className="relative max-w-4xl mx-auto w-full">
                {showEmoji && (
                    <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-2xl border border-zinc-800 overflow-hidden">
                        <EmojiPicker
                            theme={Theme.DARK}
                            emojiStyle={EmojiStyle.APPLE}
                            previewConfig={{ showPreview: false }}
                            onEmojiClick={(data) => setInputValue((prev) => prev + data.emoji)}
                            lazyLoadEmojis={true}
                        />
                    </div>
                )}

                {/* Floating Capsule Container */}
                <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900 rounded-[28px] shadow-lg border border-zinc-800/50">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800/50 transition-colors shrink-0"
                        onClick={() => setShowEmoji(!showEmoji)}
                    >
                        <Smile className="w-6 h-6" />
                    </Button>

                    <form onSubmit={handleSubmit} className="flex-1 flex gap-2 items-center">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Napisz wiadomość..."
                            // Force override padding-left with !pl-3 to fix "huge padding" issue
                            className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-zinc-500 py-3 pl-3! pr-3 text-[15px] h-auto max-h-32 min-h-[44px]"
                        // autoFocus 
                        />
                        <Button
                            type="submit"
                            disabled={isSending || disabled || !inputValue.trim()}
                            size="icon"
                            className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-md transition-transform active:scale-95 flex items-center justify-center mr-0.5"
                        >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
