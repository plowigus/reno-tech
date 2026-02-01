"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn, formatDatePL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ConversationItem {
    id: string;
    name: string | null;
    image: string | null;
    lastMessage: { content: string; createdAt: Date } | undefined;
    lastMessageAt: Date | null;
}

export function ChatSidebar({ conversations }: { conversations: ConversationItem[] }) {
    const pathname = usePathname();

    return (
        <div className="w-full md:w-80 border-r border-zinc-800 bg-zinc-950/50 flex flex-col h-[calc(100vh-80px)]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="font-semibold text-white">Wiadomości</h2>
                {/* Placeholder for "New Chat" logic later */}
                <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {conversations.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm mt-10">
                        Brak rozmów.
                    </div>
                ) : (
                    conversations.map((chat) => {
                        const isActive = pathname === `/dashboard/chat/${chat.id}`;
                        return (
                            <Link
                                key={chat.id}
                                href={`/dashboard/chat/${chat.id}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    isActive ? "bg-zinc-800" : "hover:bg-zinc-900"
                                )}
                            >
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                                    {chat.image ? (
                                        <Image src={chat.image} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">
                                            {chat.name?.charAt(0) || "?"}
                                        </div>
                                    )}
                                    {/* Online status placeholder (Green Dot) - logic comes later */}
                                    {/* <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-950 rounded-full" /> */}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <span className={cn("font-medium truncate text-sm", isActive ? "text-white" : "text-zinc-200")}>
                                            {chat.name}
                                        </span>
                                        <span className="text-[10px] text-zinc-500">
                                            {chat.lastMessageAt ? formatDatePL(chat.lastMessageAt) : ""}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate">
                                        {chat.lastMessage?.content || "Rozpocznij rozmowę..."}
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
