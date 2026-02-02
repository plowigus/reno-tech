"use client";

import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { sendMessage } from "@/app/actions/chat-actions";
import { toast } from "sonner";
import { cn, formatDatePL } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import Image from "next/image";

import { Message } from "@/types/chat";

interface ChatWindowProps {
    conversationId: string;
    initialMessages: Message[];
    currentUserId: string;
    partner?: {
        id: string;
        name: string | null;
        image: string | null;
        lastSeen: Date | null;
    } | null;
}

export function ChatWindow({ conversationId, initialMessages, currentUserId, partner }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const bottomRef = useRef<HTMLDivElement>(null);

    // 1. Subscribe to Pusher
    useEffect(() => {
        // Channel name must match backend trigger: conversation-[id]
        const channelName = `conversation-${conversationId}`;
        const channel = pusherClient.subscribe(channelName);

        // Bind to event: new-message
        channel.bind("new-message", (newMessage: Message) => {
            // Ensure createdAt is valid if needed, though we don't display date in bubble yet.
            setMessages((prev) => {
                // Avoid duplicates just in case
                if (prev.find(m => m.id === newMessage.id)) return prev;
                return [newMessage, ...prev];
            });
        });

        return () => {
            pusherClient.unsubscribe(channelName);
        };
    }, [conversationId]);

    // 2. Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (content: string) => {
        const res = await sendMessage(conversationId, content);

        if (res?.success && res.message) {
            const newMessage = res.message;
            setMessages((prev) => [newMessage, ...prev]);
        }

        if (res?.error) {
            console.error("[ChatWindow] Error toast triggered:", res.error);
            toast.error(res.error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-zinc-950 relative">
            {/* CHAT HEADER */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-transparent bg-zinc-950 sticky top-0 z-10">
                {partner ? (
                    <>
                        <div className="relative w-12 h-12">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-900">
                                {partner.image ? (
                                    <Image src={partner.image} alt={partner.name || "?"} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500 text-lg">
                                        {partner.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-white font-semibold text-lg leading-tight">{partner.name}</h2>
                            <p className="text-xs text-zinc-500 font-medium">
                                {partner.lastSeen ? `Ostatnio: ${formatDatePL(partner.lastSeen)}` : "Dostępny"}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col">
                        <h2 className="text-white font-semibold">Czat</h2>
                    </div>
                )}
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <div className="flex flex-col justify-end min-h-full">
                    {(() => {
                        const displayMessages = [...messages].reverse();
                        return displayMessages.map((msg, index) => {
                            const isMe = msg.senderId === currentUserId;
                            const nextMsg = displayMessages[index + 1];
                            const prevMsg = displayMessages[index - 1];

                            const isLastInSequence = !nextMsg || nextMsg.senderId !== msg.senderId;
                            const isFirstInSequence = !prevMsg || prevMsg.senderId !== msg.senderId;

                            return (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isMe={isMe}
                                    isLastInSequence={isLastInSequence}
                                    isFirstInSequence={isFirstInSequence}
                                />
                            );
                        });
                    })()}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* INPUT AREA */}
            <ChatInput onSend={handleSend} />
        </div>
    );
}
