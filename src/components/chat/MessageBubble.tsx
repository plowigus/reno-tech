"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
}

export function MessageBubble({ message, isMe, isLastInSequence }: { message: Message, isMe: boolean, isLastInSequence?: boolean }) {
    // Format timestamp: "14:30"
    const timeString = message.createdAt
        ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "";

    return (
        <div className={cn("flex gap-3 max-w-[75%] group relative mb-1", isMe ? "ml-auto flex-row-reverse" : "")}>
            {/* Avatar - Only for RECEIVED messages */}
            {!isMe && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 self-end mb-1">
                    {message.senderImage ? (
                        <Image src={message.senderImage} alt="User" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                            {message.senderName?.charAt(0) || "?"}
                        </div>
                    )}
                </div>
            )}

            {/* Bubble */}
            <div className={cn(
                "px-5 py-3 text-[15px] leading-relaxed relative min-w-[60px]",
                // Base Rounded Shape
                "rounded-[26px]",
                // Specific Corner Tweaks
                isMe ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-100",
                // Flatten corner if last (optional visual cue, user requested rounded-br-none for last in series)
                // Using simple logic effectively here
                isMe && "rounded-br-none",
                !isMe && "rounded-bl-none"
            )}>
                <p className="pb-1">{message.content}</p>

                {/* Timestamp inside bubble */}
                <div className={cn(
                    "text-[10px] font-medium text-right -mb-1",
                    isMe ? "text-red-200/80" : "text-zinc-400"
                )}>
                    {timeString}
                </div>
            </div>
        </div>
    );
}
