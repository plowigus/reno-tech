"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
    return (
        <div className={cn("flex gap-3 max-w-[80%] group relative mb-6", isMe ? "ml-auto flex-row-reverse" : "")}>
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
        </div>
    );
}
