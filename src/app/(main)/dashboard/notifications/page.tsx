import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllNotifications, markAllNotificationsAsRead } from "@/app/actions/forum-actions";
import { Card, CardContent } from "@/components/ui/card";
import { formatDatePL } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CheckCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"

export default async function NotificationsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const items = await getAllNotifications(50);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Powiadomienia</h2>
                    <p className="text-zinc-400">Historia Twoich aktywności.</p>
                </div>
                <form action={markAllNotificationsAsRead}>
                    <Button variant="outline" size="sm">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Oznacz wszystkie jako przeczytane
                    </Button>
                </form>
            </div>
            <Separator className="bg-zinc-800" />

            <Card className="bg-zinc-950 border-zinc-800">
                <CardContent className="p-0 divide-y divide-zinc-800">
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">Brak powiadomień.</div>
                    ) : (
                        items.map((n) => (
                            <div key={n.id} className={`p-4 flex gap-4 ${!n.isRead ? 'bg-zinc-900/40' : ''}`}>
                                {/* Avatar */}
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                                    {n.sender?.image ? (
                                        <Image src={n.sender.image} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs font-bold text-zinc-500">
                                            {n.sender?.name?.[0] || "?"}
                                        </div>
                                    )}
                                </div>
                                {/* Content */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between">
                                        <p className="text-sm text-zinc-200">
                                            <span className="font-bold">{n.sender?.name}</span>
                                            <span className="text-zinc-400">
                                                {n.type === 'REPLY' ? ' odpowiedział w temacie' : ' wspomniał Cię'}:
                                            </span>
                                        </p>
                                        <span className="text-xs text-zinc-500">{formatDatePL(n.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 italic">"{n.content}"</p>
                                    {n.targetUrl && (
                                        <Link href={n.targetUrl} className="inline-flex items-center text-xs text-red-500 hover:text-red-400 mt-1">
                                            <MessageSquare className="w-3 h-3 mr-1" />
                                            Przejdź do dyskusji
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
