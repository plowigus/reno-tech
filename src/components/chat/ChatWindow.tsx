"use client";

import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher"; // Ensure this exists
import { sendMessage } from "@/app/actions/chat-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Smile } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName?: string | null;
    senderImage?: string | null;
    createdAt: Date | string; // Handle both Server (Date) and Pusher (string)
}

interface ChatWindowProps {
    conversationId: string;
    initialMessages: Message[]; // Initial data from Server
    currentUserId: string;
}

export function ChatWindow({ conversationId, initialMessages, currentUserId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
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
    // Note: If using flex-col-reverse for chat, 'bottom' is actually the top visually.
    // Let's assume standard flex-col for simplicity first.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        console.log("[ChatWindow] Sending message...", { inputValue });
        if (!inputValue.trim() || isSending) return;

        const content = inputValue;
        setInputValue(""); // Clear immediately (Optimistic)
        setIsSending(true);

        const res = await sendMessage(conversationId, content);
        console.log("[ChatWindow] Send result:", res);
        setIsSending(false);

        if (res?.success && res.message) {
            // Manual update for sender (fixing "refresh required" issue)
            const newMessage = res.message;
            // res.message comes from Drizzle (Date object), so it matches interface
            setMessages((prev) => [newMessage, ...prev]);
        }

        if (res?.error) {
            console.error("[ChatWindow] Error toast triggered:", res.error);
            toast.error(res.error);
            setInputValue(content); // Restore text
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-zinc-950">
            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* We map in reverse if we want new messages at bottom, but let's just render normally */}
                {/* Typically chats are easier with flex-col-reverse to handle scroll-to-bottom naturally */}
                <div className="flex flex-col justify-end min-h-full gap-4">
                    {/* If initialMessages are sorted DESC (newest first), reverse them here for display */}
                    {[...messages].reverse().map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                {/* Avatar */}
                                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 mt-1">
                                    {msg.senderImage ? (
                                        <Image src={msg.senderImage} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                            {msg.senderName?.charAt(0) || "?"}
                                        </div>
                                    )}
                                </div>

                                {/* Bubble */}
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm leading-relaxed",
                                    isMe ? "bg-red-600 text-white rounded-br-none" : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm relative">
                {showEmoji && (
                    <div className="absolute bottom-20 left-4 z-50 shadow-xl rounded-xl border border-zinc-800">
                        <EmojiPicker
                            theme={Theme.DARK}
                            onEmojiClick={(data) => setInputValue((prev) => prev + data.emoji)}
                            lazyLoadEmojis={true}
                        />
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2 items-end">
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
                        autoFocus
                    />
                    <Button type="submit" disabled={isSending || !inputValue.trim()} size="icon" className="bg-red-600 hover:bg-red-700 text-white">
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
