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
import { toast } from "sonner";

interface ConversationItem {
    id: string;
    name: string | null;
    image: string | null;
    lastMessage: { content: string; createdAt: Date } | undefined;
    lastMessageAt: Date | null;
    otherUserId?: string;
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
                router.push(`/dashboard/chat/${res.conversationId}`);
            }
        } catch (error) {
            toast.error("Wystąpił błąd.");
        }
    };

    return (
        <div className="w-full md:w-80 border-r border-zinc-800 bg-zinc-950/50 flex flex-col h-[calc(100vh-80px)]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="font-semibold text-white">Wiadomości</h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Nowa wiadomość</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto">
                            {sortedFriends.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center">Brak znajomych. Dodaj kogoś w zakładce Znajomi.</p>
                            ) : (
                                sortedFriends.map(friend => {
                                    const isOnline = members.includes(friend.id);
                                    return (
                                        <button
                                            key={friend.id}
                                            onClick={() => handleStartChat(friend.id)}
                                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors"
                                        >
                                            <div className="relative w-10 h-10">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                                                    {friend.image ? (
                                                        <Image src={friend.image} alt={friend.name || "?"} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">
                                                            {friend.name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                {isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-950 rounded-full" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-sm text-zinc-200">{friend.name}</p>
                                                <p className="text-xs text-zinc-500">{isOnline ? "Aktywny teraz" : "Niedostępny"}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {conversations.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm mt-10">
                        Brak rozmów.
                    </div>
                ) : (
                    conversations.map((chat) => {
                        const isActive = pathname === `/dashboard/chat/${chat.id}`;
                        const isOnline = chat.otherUserId ? members.includes(chat.otherUserId) : false;

                        return (
                            <Link
                                key={chat.id}
                                href={`/dashboard/chat/${chat.id}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    isActive ? "bg-zinc-800" : "hover:bg-zinc-900"
                                )}
                            >
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                    {chat.image ? (
                                        <Image src={chat.image} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">
                                            {chat.name?.charAt(0) || "?"}
                                        </div>
                                    )}
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-950 rounded-full" />
                                    )}
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
