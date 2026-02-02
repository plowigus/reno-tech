"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn, formatDatePL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useActiveChannel } from "@/hooks/use-active-channel";
import { useActiveList } from "@/hooks/use-active-store";
import { startConversation } from "@/app/actions/chat-actions";
import { updateLastSeen } from "@/app/actions/user-actions";
import { toast } from "sonner";
import { useEffect } from "react";

interface ConversationItem {
    id: string;
    name: string | null;
    image: string | null;
    lastMessage: { content: string; createdAt: Date } | undefined;
    lastMessageAt: Date | null;
    otherUserId?: string;
    otherUserLastSeen?: Date | null;
}

interface FriendItem {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
}

interface ChatSidebarProps {
    conversations: ConversationItem[];
    friends: FriendItem[];
    currentUserId: string;
}

export function ChatSidebar({ conversations, friends, currentUserId }: ChatSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { members } = useActiveList();
    useActiveChannel(); // Subscribe to presence channel
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        updateLastSeen();
    }, []);

    const sortedFriends = [...friends].sort((a, b) => {
        const aOnline = members.includes(a.id);
        const bOnline = members.includes(b.id);
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return 0;
    });

    const handleStartChat = async (friendId: string) => {
        setIsDialogOpen(false);
        try {
            const res = await startConversation(friendId);
            if (res.error) {
                toast.error(res.error);
            } else if (res.conversationId) {
                router.push(`/dashboard/chat/${res.conversationId}`, { scroll: false });
            }
        } catch (error) {
            toast.error("Wystąpił błąd.");
        }
    };

    return (
        <div className="w-full md:w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-80px)]">
            <div className="p-4 flex justify-between items-center">
                <h2 className="font-semibold text-white text-lg ml-2">Wiadomości</h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Nowa wiadomość</DialogTitle>
                        </DialogHeader>
                        <div className="mt-2">
                            {/* Capsule Search Input Mockup - Functional filtering could be added here later */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Szukaj znajomego..."
                                    className="w-full bg-zinc-900 text-sm text-zinc-200 placeholder:text-zinc-500 rounded-full py-2.5 px-4 outline-none focus:ring-1 focus:ring-zinc-700"
                                />
                            </div>

                            <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                                {sortedFriends.length === 0 ? (
                                    <p className="text-zinc-500 text-sm text-center py-4">Brak znajomych. Dodaj kogoś w zakładce Znajomi.</p>
                                ) : (
                                    sortedFriends.map(friend => {
                                        const isOnline = members.includes(friend.id);
                                        return (
                                            <button
                                                key={friend.id}
                                                onClick={() => handleStartChat(friend.id)}
                                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-900 transition-all duration-200 group"
                                            >
                                                <div className="relative w-10 h-10 shrink-0">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border-2 border-transparent group-hover:border-zinc-800 transition-colors">
                                                        {friend.image ? (
                                                            <Image src={friend.image} alt={friend.name || "?"} fill className="object-cover rounded-full" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">
                                                                {friend.name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[2.5px] border-zinc-950 rounded-full" />
                                                    )}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-zinc-200 truncate">{friend.name}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{isOnline ? "Aktywny teraz" : "Niedostępny"}</p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                {conversations.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm mt-10">
                        Brak rozmów.
                    </div>
                ) : (
                    conversations.map((chat) => {
                        const isActive = pathname === `/dashboard/chat/${chat.id}`;
                        const isOnline = chat.otherUserId ? members.includes(chat.otherUserId) : false;

                        return (
                            <div
                                key={chat.id}
                                onClick={() => router.push(`/dashboard/chat/${chat.id}`, { scroll: false })}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer",
                                    isActive ? "bg-zinc-900/80 shadow-sm" : "hover:bg-zinc-900/50"
                                )}
                            >
                                <div className="relative w-11 h-11 shrink-0">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 border-2 border-transparent">
                                        {chat.image ? (
                                            <Image src={chat.image} alt="User" fill className="object-cover rounded-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">
                                                {chat.name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </div>
                                    {/* STATUS INDICATOR */}
                                    <span className={cn(
                                        "absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-[2.5px] border-zinc-950 z-10",
                                        isOnline ? "bg-green-500" : "bg-transparent border-none"
                                    )} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={cn("font-medium truncate text-[15px]", isActive ? "text-white" : "text-zinc-200")}>
                                            {chat.name}
                                        </span>
                                        <span className="text-[10px] text-zinc-600 font-medium ml-2 shrink-0">
                                            {chat.lastMessageAt ? formatDatePL(chat.lastMessageAt).split(" ")[1] : ""} {/* Just time for compactness, or full date? Let's use existing format for now but maybe cleaner */}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={cn("text-xs truncate max-w-[140px]", isActive ? "text-zinc-400" : "text-zinc-500")}>
                                            {chat.lastMessage?.content || "Rozpocznij konwersację"}
                                        </p>
                                    </div>
                                </div>
                                );
                    })
                )}
                            </div>
        </div >
            );
}
