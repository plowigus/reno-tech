"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
    onReaction: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😥", "😡"];

export function MessageBubble({ message, isMe, onReaction }: MessageBubbleProps) {
    return (
        <div className={cn("flex gap-3 max-w-[80%] group relative mb-6", isMe ? "ml-auto flex-row-reverse" : "")}>
            {/* Reaction Trigger (Hover) */}
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-zinc-900 border border-zinc-700 rounded-full p-1 shadow-lg z-10",
                isMe ? "right-full mr-2" : "left-full ml-2"
            )}>
                {QUICK_REACTIONS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => onReaction(message.id, emoji)}
                        className="hover:scale-125 transition-transform text-lg leading-none p-1"
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            {/* Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 mt-1">
                {message.senderImage ? (
                    <Image src={message.senderImage} alt="User" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                        {message.senderName?.charAt(0) || "?"}
                    </div>
                )}
            </div>

            {/* Bubble */}
            <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                isMe ? "bg-red-600 text-white rounded-br-none" : "bg-zinc-800 text-zinc-200 rounded-bl-none"
            )}>
                {message.content}
            </div>

            {/* Reactions Display */}
            {message.reactions && message.reactions.length > 0 && (
                <div className={cn(
                    "absolute -bottom-5 flex gap-1",
                    isMe ? "right-0" : "left-0"
                )}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1 shadow-sm">
                        {Array.from(new Set(message.reactions.map(r => r.emoji))).slice(0, 3).map(emoji => (
                            <span key={emoji}>{emoji}</span>
                        ))}
                        <span className="text-zinc-500 font-medium ml-1">
                            {message.reactions.length}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
