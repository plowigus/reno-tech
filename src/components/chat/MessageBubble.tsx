"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Message } from "@/types/chat";

export function MessageBubble({ message, isMe, isLastInSequence, isFirstInSequence }: { message: Message, isMe: boolean, isLastInSequence?: boolean, isFirstInSequence?: boolean }) {

    // Instagram-like rounding logic
    // We want merged corners between messages of same sender

    const roundedClass = isMe
        ? cn(
            "rounded-[22px]",
            !isFirstInSequence && "rounded-tr-md", // Connect with previous (top-right small)
            !isLastInSequence && "rounded-br-md"   // Connect with next (bottom-right small)
        )
        : cn(
            "rounded-[22px]",
            !isFirstInSequence && "rounded-tl-md", // Connect with previous (top-left small)
            !isLastInSequence && "rounded-bl-md"   // Connect with next (bottom-left small)
        );

    return (
        <div className={cn("flex items-end gap-2 max-w-[70%] group relative mb-0.5", isMe ? "ml-auto flex-row-reverse" : "")}>
            {/* Avatar - Only for RECEIVED messages and ONLY if last in sequence */}
            {!isMe && (
                <div className={cn("relative w-7 h-7 shrink-0 mb-1", isLastInSequence ? "visible" : "invisible")}>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 ring-1 ring-zinc-800">
                        {message.senderImage ? (
                            <Image src={message.senderImage} alt="User" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-zinc-500">
                                {message.senderName?.charAt(0) || "?"}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bubble */}
            <div className={cn(
                "px-4 py-2.5 text-[15px] leading-snug break-words min-w-[20px] transition-all",
                roundedClass,
                // Colors
                isMe
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 text-zinc-100"
            )}>
                {message.content}
            </div>

            {/* Timestamp removed as requested */}
        </div>
    );
}
