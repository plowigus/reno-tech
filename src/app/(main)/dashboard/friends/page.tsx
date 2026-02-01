import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFriends, getFriendRequests } from "@/app/actions/friend-actions";
import { FriendsView } from "@/components/dashboard/friends/FriendsView";
import { Users } from "lucide-react";

export default async function FriendsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    // Pobierz dane równolegle dla szybkości
    const [friends, requests] = await Promise.all([
        getFriends(),
        getFriendRequests()
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-red-600" />
                        Znajomi
                    </h2>
                    <p className="text-muted-foreground">Zarządzaj swoją siecią kontaktów.</p>
                </div>
            </div>

            <FriendsView friends={friends} requests={requests} />
        </div>
    );
}
