"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/forum-actions";
import { useRouter } from "next/navigation";
import { formatDatePL } from "@/lib/utils";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface Notification {
    id: string;
    type: "REPLY" | "MENTION" | "SYSTEM" | string;
    content: string | null;
    resourceId: string | null;
    createdAt: Date;
    sender: {
        name: string | null;
        image: string | null;
    } | null;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Fetch on mount and when menu opens
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getUnreadNotifications();
                setNotifications(data as unknown as Notification[]);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetch();

        // Optional: Poll every 60s
        const interval = setInterval(fetch, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRead = async (notification: Notification) => {
        // Optimistic UI update
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

        // Server Action
        await markNotificationAsRead(notification.id);

        // Redirect logic
        if (notification.type === "REPLY" && notification.resourceId) {
            router.push(`/forum`);
        }

        setIsOpen(false);
        router.refresh();
    };

    const handleMarkAll = async () => {
        setNotifications([]);
        await markAllNotificationsAsRead();
        setIsOpen(false);
        router.refresh();
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div className="group relative p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer outline-none">
                    <Bell className="text-white transition-colors group-hover:text-red-500" size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-foreground shadow-sm ring-2 ring-black">
                            {notifications.length > 99 ? "99+" : notifications.length}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-zinc-950 border-zinc-800 text-white p-0">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <span className="font-semibold text-sm">Powiadomienia ({notifications.length})</span>
                    {notifications.length > 0 && (
                        <button onClick={handleMarkAll} className="text-xs text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Oznacz wszystkie
                        </button>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-zinc-500">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                            Ładowanie...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            Brak nowych powiadomień
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                onClick={() => handleRead(n)}
                                className="p-4 focus:bg-zinc-900 cursor-pointer border-b border-zinc-900 last:border-0 items-start gap-3"
                            >
                                {/* Sender Avatar */}
                                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800 border border-zinc-700">
                                    {n.sender?.image ? (
                                        <Image src={n.sender.image} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                            {n.sender?.name?.charAt(0) || "S"}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <p className="text-sm leading-snug">
                                        <span className="font-semibold text-white">{n.sender?.name}</span>
                                        <span className="text-zinc-400"> {n.type === 'REPLY' ? 'odpowiedział w temacie' : 'wspomniał Cię'}: </span>
                                    </p>
                                    <p className="text-xs text-zinc-500 line-clamp-2 italic">
                                        "{n.content}"
                                    </p>
                                    <p className="text-[10px] text-zinc-600 uppercase mt-1">
                                        {formatDatePL(n.createdAt)}
                                    </p>
                                </div>

                                <div className="h-2 w-2 rounded-full bg-red-600 flex-shrink-0 mt-1.5" />
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
