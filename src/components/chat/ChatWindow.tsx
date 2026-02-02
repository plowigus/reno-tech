"use client";

import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher"; // Ensure this exists
import { sendMessage, toggleReaction } from "@/app/actions/chat-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Used in case we need wrapper styling
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

import { Message } from "@/types/chat";

interface ChatWindowProps {
    conversationId: string;
    initialMessages: Message[]; // Initial data from Server
    currentUserId: string;
}

export function ChatWindow({ conversationId, initialMessages, currentUserId }: ChatWindowProps) {
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

        // Bind to event: message-reaction-update
        channel.bind("message-reaction-update", (data: { messageId: string; reactions: Message['reactions'] }) => {
            setMessages((prev) => prev.map(msg => {
                if (msg.id === data.messageId) {
                    return { ...msg, reactions: data.reactions };
                }
                return msg;
            }));
        });

        return () => {
            pusherClient.unsubscribe(channelName);
        };
    }, [conversationId]);

    // 2. Auto-scroll to bottom on new message
    // Note: If using flex-col-reverse for chat, 'bottom' is actually the top visually.
    // Let's assume standard flex-col for simplicity first.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (content: string) => {
        const res = await sendMessage(conversationId, content);

        if (res?.success && res.message) {
            // Manual update for sender (fixing "refresh required" issue)
            const newMessage = res.message;
            // res.message comes from Drizzle (Date object), so it matches interface
            setMessages((prev) => [newMessage, ...prev]);
        }

        if (res?.error) {
            console.error("[ChatWindow] Error toast triggered:", res.error);
            toast.error(res.error);
        }
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        // Optimistic UI Update
        setMessages(prev => prev.map(msg => {
            if (msg.id !== messageId) return msg;

            const existingReactionIndex = msg.reactions?.findIndex(
                r => r.userId === currentUserId && r.emoji === emoji
            );

            let newReactions = [...(msg.reactions || [])];

            if (existingReactionIndex !== undefined && existingReactionIndex !== -1) {
                // Remove reaction
                newReactions.splice(existingReactionIndex, 1);
            } else {
                // Add reaction
                newReactions.push({
                    messageId,
                    userId: currentUserId,
                    emoji,
                    user: { id: currentUserId, name: null } // Name optional for count
                });
            }

            return { ...msg, reactions: newReactions };
        }));

        // Fire and forget - Pusher will reconcile eventually, or we revert on error if we want strict consistency
        try {
            await toggleReaction(messageId, emoji);
        } catch (error) {
            console.error("Failed to toggle reaction:", error);
            toast.error("Nie udało się dodać reakcji.");
            // Ideally revert state here
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-zinc-950">
            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex flex-col justify-end min-h-full gap-4">
                    {/* If initialMessages are sorted DESC (newest first), reverse them here for display */}
                    {[...messages].reverse().map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMe={msg.senderId === currentUserId}
                            onReaction={handleReaction}
                        />
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* INPUT AREA */}
            <ChatInput onSend={handleSend} />
        </div>
    );
}
